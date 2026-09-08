const APTLY_BASE_URL = "https://core-api.getaptly.com";
const DEFAULT_BOARD_ID = "2phWRbsLuL5pNv9af";

function clean(value, max = 180) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function normalized(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fieldName(field) {
  return normalized(field.label || field.name);
}

function fieldKey(field) {
  return field.key || field.uuid || "";
}

function findField(fields, names, types) {
  const wanted = names.map(normalized);
  return fields.find((field) => {
    if (field.archived || !fieldKey(field)) return false;
    const typeMatches = !types || types.map(normalized).includes(normalized(field.type));
    const name = fieldName(field);
    return typeMatches && wanted.some((candidate) => name === candidate || name.includes(candidate));
  });
}

function contactId(response) {
  const contact = response?.data || response;
  return contact?._id || contact?.uuid || "";
}

function isEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

async function aptlyFetch(path, token, init = {}) {
  const response = await fetch(`${APTLY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-token": token,
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Aptly ${path} returned ${response.status}: ${JSON.stringify(data)?.slice(0, 500)}`);
  }
  return data;
}

function buildDescription(values) {
  return [
    "Agent Referral – Website",
    "",
    "REFERRED OWNER",
    `Name: ${values.ownerFirstName} ${values.ownerLastName}`,
    `Email: ${values.ownerEmail}`,
    `Phone: ${values.ownerPhone}`,
    `Rental property address: ${values.propertyAddress || "Not provided"}`,
    "Contact type: Owner Prospect",
    "",
    "REFERRING AGENT",
    `Name: ${values.agentFirstName} ${values.agentLastName}`,
    `Email: ${values.agentEmail}`,
    `Phone: ${values.agentPhone}`,
    "Contact type: Agent",
    "",
    "SOURCE",
    "Website – Agents page",
  ].join("\n");
}

function setPersonFields(card, fields, ownerId, agentId) {
  const personFields = fields.filter((field) =>
    !field.archived && fieldKey(field) && ["person", "persons"].includes(normalized(field.type)),
  );
  const ownerField = findField(personFields, ["Owner Prospect", "Prospective Owner", "Owner Contact", "Owner"]);
  const agentField = findField(personFields, ["Referring Agent", "Referral Agent", "Agent Contact", "Agent"]);
  const combinedField = personFields.find((field) => normalized(field.type) === "persons");
  let ownerAttached = false;
  let agentAttached = false;

  if (ownerField && ownerField !== agentField) {
    card[fieldKey(ownerField)] = normalized(ownerField.type) === "persons" ? [ownerId] : ownerId;
    ownerAttached = true;
  }
  if (agentField && agentField !== ownerField) {
    card[fieldKey(agentField)] = normalized(agentField.type) === "persons" ? [agentId] : agentId;
    agentAttached = true;
  }
  if (combinedField) {
    card[fieldKey(combinedField)] = [...new Set([...(card[fieldKey(combinedField)] || []), ownerId, agentId])];
    ownerAttached = true;
    agentAttached = true;
  }
  if ((!ownerAttached || !agentAttached) && personFields.length >= 2) {
    const available = personFields.filter((field) => field !== combinedField);
    if (!ownerAttached && available[0]) {
      card[fieldKey(available[0])] = ownerId;
      ownerAttached = true;
    }
    const agentTarget = available.find((field) => fieldKey(field) !== fieldKey(available[0]));
    if (!agentAttached && agentTarget) {
      card[fieldKey(agentTarget)] = agentId;
      agentAttached = true;
    }
  }
  if (!ownerAttached || !agentAttached) {
    throw new Error("The Owner Leads board needs a persons field, or separate Owner and Agent person fields, to attach both referral contacts.");
  }
}

export async function onRequestPost({ request, env }) {
  const token = env.APTLY_API_TOKEN;
  const boardId = env.APTLY_OWNER_LEADS_BOARD_ID || DEFAULT_BOARD_ID;
  if (!token) {
    console.error("Agent referral integration is missing its hosted Aptly API token.");
    return Response.json(
      { message: "We couldn't send the referral right now. Please call (254) 400-2863." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Please review the referral form and try again." }, { status: 400 });
  }

  if (clean(body.website)) return Response.json({ message: "Thank you! Your referral has been received." });

  const values = {
    ownerFirstName: clean(body.ownerFirstName, 80),
    ownerLastName: clean(body.ownerLastName, 80),
    ownerEmail: clean(body.ownerEmail, 180).toLowerCase(),
    ownerPhone: clean(body.ownerPhone, 40),
    propertyAddress: clean(body.propertyAddress, 280),
    agentFirstName: clean(body.agentFirstName, 80),
    agentLastName: clean(body.agentLastName, 80),
    agentEmail: clean(body.agentEmail, 180).toLowerCase(),
    agentPhone: clean(body.agentPhone, 40),
  };
  const required = [
    values.ownerFirstName,
    values.ownerLastName,
    values.ownerEmail,
    values.ownerPhone,
    values.agentFirstName,
    values.agentLastName,
    values.agentEmail,
    values.agentPhone,
  ];
  if (required.some((value) => !value) || !isEmail(values.ownerEmail) || !isEmail(values.agentEmail)) {
    return Response.json(
      { message: "Please complete the owner and agent contact information with valid email addresses." },
      { status: 400 },
    );
  }
  if (clean(body.sharingPermission) !== "yes") {
    return Response.json({ message: "Please confirm that you have permission to share this referral." }, { status: 400 });
  }

  try {
    const [schemaResponse, configurationResponse] = await Promise.all([
      aptlyFetch(`/api/schema/${encodeURIComponent(boardId)}`, token),
      aptlyFetch(`/api/board/${encodeURIComponent(boardId)}/configuration`, token),
    ]);
    const schemaFields = Array.isArray(schemaResponse) ? schemaResponse : schemaResponse?.data || [];
    const config = configurationResponse?.data || configurationResponse || {};
    const configFields = Array.isArray(config.fields) ? config.fields : [];
    const fields = [...schemaFields, ...configFields].filter(
      (field, index, all) => index === all.findIndex((candidate) => fieldKey(candidate) === fieldKey(field)),
    );
    const description = buildDescription(values);
    const descriptionField = findField(fields, ["Description", "Lead Description", "Card Description", "Referral Details"]);
    const addressField = findField(fields, ["Rental Property Address"]);
    const stageField = findField(fields, ["Stage", "Lead Stage", "Status", "Workflow"], ["select", "singleselect", "text", "string"]);
    const sourceField = findField(fields, ["Source", "Lead Source"]);
    const personFields = fields.filter((field) =>
      !field.archived && fieldKey(field) && ["person", "persons"].includes(normalized(field.type)),
    );
    if (!descriptionField) throw new Error("The Owner Leads board does not contain a Description field.");
    if (!personFields.some((field) => normalized(field.type) === "persons") && personFields.length < 2) {
      throw new Error("The Owner Leads board cannot attach both referral contacts.");
    }

    const [ownerResponse, agentResponse] = await Promise.all([
      aptlyFetch("/api/contacts", token, {
        method: "POST",
        body: JSON.stringify({
          firstname: values.ownerFirstName,
          lastname: values.ownerLastName,
          email: values.ownerEmail,
          phone: [{ number: values.ownerPhone, type: "mobile" }],
          contactType: "Owner Prospect",
        }),
      }),
      aptlyFetch("/api/contacts", token, {
        method: "POST",
        body: JSON.stringify({
          firstname: values.agentFirstName,
          lastname: values.agentLastName,
          email: values.agentEmail,
          phone: [{ number: values.agentPhone, type: "mobile" }],
          contactType: "Agent",
        }),
      }),
    ]);

    const ownerId = contactId(ownerResponse);
    const agentId = contactId(agentResponse);
    if (!ownerId || !agentId) throw new Error("Aptly did not return both referral contact IDs.");

    const ownerName = `${values.ownerFirstName} ${values.ownerLastName}`;
    const card = {
      name: values.propertyAddress ? `${ownerName} – ${values.propertyAddress}` : `${ownerName} – Agent Referral`,
      Stage: "New Lead",
      Source: "Website",
    };
    card[fieldKey(descriptionField)] = description;
    if (addressField && values.propertyAddress) {
      card[fieldKey(addressField)] = normalized(addressField.type) === "address"
        ? {
            address: values.propertyAddress.split(",")[0],
            street: values.propertyAddress.split(",")[0],
            formattedAddress: values.propertyAddress,
          }
        : values.propertyAddress;
    }
    if (stageField) card[fieldKey(stageField)] = "New Lead";
    if (sourceField) card[fieldKey(sourceField)] = "Website";
    setPersonFields(card, fields, ownerId, agentId);

    const workflows = Array.isArray(config.workflows) ? config.workflows : [];
    const newLeadWorkflow = workflows.find((workflow) =>
      [workflow.name, workflow.title, workflow.label]
        .some((value) => ["new lead", "new leads"].includes(normalized(value))),
    );
    if (!stageField && newLeadWorkflow) {
      const workflowId = newLeadWorkflow.uuid || newLeadWorkflow._id || newLeadWorkflow.id;
      if (workflowId) {
        card.workflow = workflowId;
        card.sequence = workflowId;
      }
    }

    await aptlyFetch(`/api/board/${encodeURIComponent(boardId)}`, token, {
      method: "POST",
      body: JSON.stringify(card),
    });
    return Response.json({ message: "Thank you! Your referral has been sent to J R Grace Realty." });
  } catch (error) {
    console.error("Unable to create Aptly agent referral:", error instanceof Error ? error.message : error);
    return Response.json(
      { message: "We couldn't send the referral right now. Please call (254) 400-2863." },
      { status: 502 },
    );
  }
}

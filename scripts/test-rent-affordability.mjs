import assert from "node:assert/strict";
import { calculateRentBudget, listingUrl, matchingListings } from "../rent-affordability.js";

const baseline = calculateRentBudget({ annualIncome: 60000 });
assert.equal(baseline.grossMonthly, 5000);
assert.equal(baseline.recommended, 1500);
assert.equal(baseline.comfortable, 1250);

const refined = calculateRentBudget({ annualIncome: 60000, monthlyExpenses: 1600, monthlyDebts: 500, monthlySavings: 400 });
assert.equal(refined.commitments, 2500);
assert.equal(refined.recommended, 1250);

const listings = [
  { _id: "one", address: { address: "101 Main Street", city: "Waco", stateCode: "TX" }, marketRent: { amount: 120000 } },
  { _id: "two", address: { address: "202 Lake Drive", city: "Waco", stateCode: "TX" }, marketRent: { amount: 175000 } },
  { _id: "three", address: { address: "303 Oak Road", city: "Hewitt", stateCode: "TX" }, marketRent: { amount: 100000 } },
];
assert.deepEqual(matchingListings(listings, "Waco", 1500).map(listing => listing._id), ["one"]);
assert.equal(listingUrl(listings[0]), "/rentals/waco-tx/101-main-street/one");

console.log("Rent affordability calculations and listing matching tests passed.");

import { TICKET_DB } from "../../../db/ticket.ts";

export type T_ticketCities = {
  from_city: string;
  to_city: string;
};

const UNKNOWN_CITY = "未知";

// Reuse the ticket DB to build a stable city dictionary for deterministic parsing.
// This keeps common supported routes off the model path and avoids format-sensitive failures.
const KNOWN_CITIES = Array.from(
  new Set(
    Object.keys(TICKET_DB).flatMap((routeKey) => {
      const [from_city, to_city] = routeKey.split("-");
      return [from_city, to_city];
    })
  )
).sort((left, right) => right.length - left.length);

function normalizeTicketText(text: string): string {
  return text.replace(/\s+/g, "");
}

function findOrderedCities(text: string): string[] {
  const normalizedText = normalizeTicketText(text);
  const matches: Array<{ city: string; index: number }> = [];

  for (const city of KNOWN_CITIES) {
    const index = normalizedText.indexOf(city);
    if (index === -1) continue;

    matches.push({ city, index });
  }

  matches.sort((left, right) => {
    if (left.index !== right.index) {
      return left.index - right.index;
    }

    return right.city.length - left.city.length;
  });

  return matches
    .map(({ city }) => city)
    .filter((city, index, list) => list.indexOf(city) === index);
}

export function extractTicketCitiesFromText(
  text: string
): T_ticketCities | null {
  const orderedCities = findOrderedCities(text);
  if (orderedCities.length < 2) {
    return null;
  }

  return {
    from_city: orderedCities[0],
    to_city: orderedCities[1],
  };
}

export function extractTicketCitiesFromModelOutput(
  output: string
): T_ticketCities | null {
  const normalizedOutput = normalizeTicketText(output)
    .replace(/[，]/g, ",")
    .replace(/->|→|至/g, ",");

  const parts = normalizedOutput
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const [from_city, to_city] = parts;
    return { from_city, to_city };
  }

  const orderedCities = findOrderedCities(output);
  if (orderedCities.length < 2) {
    return null;
  }

  return {
    from_city: orderedCities[0],
    to_city: orderedCities[1],
  };
}

export function fallbackTicketCities(): T_ticketCities {
  return {
    from_city: UNKNOWN_CITY,
    to_city: UNKNOWN_CITY,
  };
}

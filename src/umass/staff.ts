import { sanitize } from "#shared/stringUtil";

import { connectToCollection } from "./database";
import { Staff } from "./types";

export interface ScoredStaff extends Staff {
  _score: number;
}

export async function getStaffListFromQuery(query: string): Promise<Array<ScoredStaff>> {
  query = sanitize(query);

  return connectToCollection(
    "staff",
    staffCollection =>
      staffCollection
        .aggregate([
          { $match: { $text: { $search: query } } },
          {
            $addFields: {
              _score: {
                $divide: [{ $meta: "textScore" }, { $size: "$names" }],
              },
            },
          },
          { $sort: { _score: -1 } },
          { $match: { _score: { $gt: 0.3 } } },
        ])
        .toArray() as Promise<Array<ScoredStaff>>,
  );
}

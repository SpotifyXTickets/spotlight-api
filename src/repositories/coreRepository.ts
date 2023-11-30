import {
  MongoClient,
  Db,
  Collection,
  ServerApiVersion,
  ObjectId,
} from "mongodb";
import { DB } from "../db/db";

export abstract class CoreRepository {
  protected db: Promise<Db>;
  protected collection: Promise<Collection>;
  public collectionName: string;
  private relations: Array<{
    name: string;
    foreignTable: string;
    primaryKey: string;
    foreignKey: string;
  }>;

  constructor(
    collectionName: string,
    uniqueIndexes?: string[],
    mtmRelations?: Array<{
      name: string;
      foreignTable: string;
      primaryKey?: string;
      foreignKey?: string;
    }>
  ) {
    this.db = DB.getDB();
    this.relations = [];
    if (mtmRelations) {
      this.relations = mtmRelations.map((relation) => {
        return {
          name: relation.name,
          foreignTable: relation.foreignTable,
          primaryKey: relation.primaryKey || "_id",
          foreignKey: relation.foreignKey || "_id",
        };
      });
    }
    this.collectionName = collectionName;
    this.collection = new Promise<Collection>(async (resolve, reject) => {
      try {
        const db = await this.db;
        const relationPromise = new Promise<void>(async (resolve, reject) => {
          try {
            if (this.relations.length > 0) {
              this.relations.forEach(async (relation) => {
                const relCollection = db.collection(relation.name);
                if (
                  (await db.listCollections({ name: relation.name }).toArray())
                    .length < 1
                ) {
                  await relCollection.createIndex(
                    {
                      [collectionName + "Id"]: 1,
                      [relation.foreignTable + "Id"]: 1,
                    },
                    { unique: true }
                  );
                }
              });
            }
            resolve();
          } catch (e) {
            reject(e);
          }
        });

        const primaryCollection = db.collection(collectionName);
        if (uniqueIndexes) {
          uniqueIndexes.forEach(async (index) => {
            await primaryCollection.createIndex(index, { unique: true });
          });
        }
        await relationPromise;
        resolve(primaryCollection);
      } catch (e) {
        reject(e);
      }
    });
  }

  private async getRelationCollection(
    collectionName: string
  ): Promise<Collection | boolean> {
    const db = await this.db;
    if (
      this.relations.find((relation) => relation.name === collectionName) ===
      undefined
    ) {
      return false;
    }
    return db.collection(collectionName);
  }

  protected async insertIntoRelationTable(
    relationName: string,
    foreignKey: ObjectId | number | string,
    primaryKey: ObjectId | number | string
  ): Promise<boolean> {
    const relationCollection = await this.getRelationCollection(relationName);
    const relation = this.relations.find(
      (relation) => relation.name === relationName
    );

    if (!(relationCollection instanceof Collection) || relation === undefined) {
      return false;
    }

    try {
      const data = await relationCollection.insertOne({
        foreignTable: relation.foreignTable,
        originTable: this.collectionName,
        [relation.foreignTable + "Id"]: foreignKey,
        [this.collectionName + "Id"]: primaryKey,
      });

      return data.acknowledged;
    } catch (e) {
      return false;
    }
  }

  protected async removeFromRelationTable(
    relationName: string,
    anyKey:
      | { foreignKey: ObjectId | number | string }
      | { primaryKey: ObjectId | number | string }
  ): Promise<boolean> {
    const relationCollection = await this.getRelationCollection(relationName);
    const relation = this.relations.find(
      (relation) => relation.name === relationName
    );

    if (!(relationCollection instanceof Collection) || relation === undefined) {
      return false;
    }

    let keyName = "";
    let keyValue: ObjectId | number | string;

    if (anyKey.hasOwnProperty("foreignKey")) {
      keyName = relation.foreignTable + "Id";
      keyValue = (anyKey as { foreignKey: ObjectId | number | string })
        .foreignKey;
    } else if (anyKey.hasOwnProperty("primaryKey")) {
      keyName = this.collectionName + "Id";
      keyValue = (anyKey as { primaryKey: ObjectId | number | string })
        .primaryKey;
    } else {
      return false;
    }

    const data = await relationCollection.deleteMany({
      foreignTable: relation.foreignTable,
      originTable: this.collectionName,
      [keyName]: keyValue,
    });

    return data.acknowledged;
  }

  protected async getKeysFromRelationTable(
    relationName: string,
    anyKey:
      | { foreignKey: ObjectId | number | string }
      | { primaryKey: ObjectId | number | string }
  ): Promise<ObjectId[] | number[] | string[] | boolean> {
    const relationCollection = await this.getRelationCollection(relationName);
    const relation = this.relations.find(
      (relation) => relation.name === relationName
    );

    if (!(relationCollection instanceof Collection) || relation === undefined) {
      return [];
    }

    let keyName = "";
    let keyValue: ObjectId | number | string;

    if (anyKey.hasOwnProperty("foreignKey")) {
      keyName = relation.foreignTable + "Id";
      keyValue = (anyKey as { foreignKey: ObjectId | number | string })
        .foreignKey;
    } else if (anyKey.hasOwnProperty("primaryKey")) {
      keyName = this.collectionName + "Id";
      keyValue = (anyKey as { primaryKey: ObjectId | number | string })
        .primaryKey;
    } else {
      return [];
    }

    const data = await relationCollection
      .find({
        foreignTable: relation.foreignTable,
        originTable: this.collectionName,
        [keyName]: keyValue,
      })
      .toArray();

    if (anyKey.hasOwnProperty("foreignKey")) {
      return data.map((d) => d[this.collectionName + "Id"]);
    } else if (anyKey.hasOwnProperty("primaryKey")) {
      return data.map((d) => d[relation.foreignTable + "Id"]);
    } else {
      return false;
    }
  }

  // Add your methods for communicating with MongoDB here
}

export default CoreRepository;

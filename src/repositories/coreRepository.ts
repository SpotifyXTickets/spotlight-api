import { MongoClient, Db, Collection } from "mongodb";

export abstract class CoreRepository {
  protected db!: Db;
  protected collection!: Collection;

  constructor(collectionName: string, testDb?: Db) {
    if (!testDb) {
      MongoClient.connect(
        process.env.MONGODB_URL ?? "mongodb://localhost:27017"
      )
        .then((client) => {
          this.db = client.db("CitricDB");
          if (!this.collectionExists(collectionName)) {
            this.createCollection(collectionName);
          }
          this.collection = this.db.collection(collectionName);
        })
        .catch((error) => console.error(error));
    } else {
      this.db = testDb;
      if (!this.collectionExists(collectionName)) {
        this.createCollection(collectionName);
      }
      this.collection = this.db.collection(collectionName);
    }
  }

  protected async createCollection(collectionName: string): Promise<void> {
    await this.db.createCollection(collectionName);
  }

  protected async collectionExists(collectionName: string): Promise<boolean> {
    return await this.db
      .listCollections()
      .toArray()
      .then((collections) => {
        return collections.some(
          (collection) => collection.name === collectionName
        );
      });
  }

  // Add your methods for communicating with MongoDB here
}

export default CoreRepository;

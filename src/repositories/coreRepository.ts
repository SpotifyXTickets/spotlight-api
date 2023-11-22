import { MongoClient, Db, Collection, ServerApiVersion } from "mongodb";

export abstract class CoreRepository {
  protected db?: Db;
  protected collection?: Collection;
  private collectionName: string;
  private client: MongoClient;

  constructor(collectionName: string, testDb?: Db) {
    this.client = new MongoClient(
      process.env.MONGODB_URL ?? "mongodb://localhost:27017",
      {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      }
    );
    // if (!testDb) {
    //   MongoClient.connect(
    //     process.env.MONGODB_URL ?? "mongodb://localhost:27017"
    //   )
    //     .then((client) => {
    //       this.db = client.db("CitricDB");
    //       if (!this.collectionExists(collectionName)) {
    //         this.createCollection(collectionName);
    //       }
    //       this.collection = this.db.collection(collectionName);
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    // } else {
    //   this.db = testDb;
    //   if (!this.collectionExists(collectionName)) {
    //     this.createCollection(collectionName);
    //   }
    //   this.collection = this.db.collection(collectionName);
    // }
    this.collectionName = collectionName;
  }

  protected async initalizeMongo(): Promise<void> {
    if (!this.db) {
      try {
        const host = process.env.MONGODB_URL ?? "mongodb://localhost:27017";
        await this.client.connect();
        await this.client.db("CitricDB").command({ ping: 1 });
        this.db = this.client.db("CitricDB");
        if (!this.collectionExists(this.collectionName)) {
          this.createCollection(this.collectionName);
        }
        this.collection = this.db.collection(this.collectionName);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async createCollection(collectionName: string): Promise<void> {
    if (!this.db) {
      await this.initalizeMongo();
    }
    await this.db!.createCollection(collectionName);
  }

  private async collectionExists(collectionName: string): Promise<boolean> {
    if (!this.db) {
      await this.initalizeMongo();
    }
    return await this.db!.listCollections()
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

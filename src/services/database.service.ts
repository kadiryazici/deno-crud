import { saveDb, setWithoutSave, useDb } from 'db';

export class DatabaseService {
  public data = useDb;
  public set = setWithoutSave;
  public setAndSave = saveDb;

  public save() {
    return saveDb();
  }
}

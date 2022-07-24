import { fileExistsSync, getRoot } from 'helpers';

import { AppConfig } from 'types';
import { appConfig } from '@/common/constants.ts';
import { join } from 'path';

const configPath = join(getRoot(), 'config.json');

export default function () {
  if (fileExistsSync(configPath)) {
    const file = Deno.readTextFileSync(configPath);

    try {
      const payload: AppConfig = JSON.parse(file);

      for (const key of Object.keys(payload)) {
        // @ts-expect-error dynamic property name hell
        appConfig[key] = payload[key];
      }
    } catch {
      console.log('Config file was not a valid json file, continuing default configs.');
    }
  } else {
    Deno.writeTextFileSync(configPath, JSON.stringify(appConfig, undefined, 2));
  }
}

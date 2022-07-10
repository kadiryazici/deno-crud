export function fileExistsSync(path: string) {
  try {
    Deno.statSync(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw new Error(`Couldnt get file info of ${path}`);
  }
}

export async function fileExists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw new Error(`Couldnt get file info of ${path}`);
  }
}

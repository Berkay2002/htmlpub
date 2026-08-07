import { createPublishingService } from "@htmlpub/core";
import { createBlobGateway } from "./blob";
import { appOrigin } from "./env";
import { getRepository } from "./repository";

let service: ReturnType<typeof createPublishingService> | null = null;

export function getPublishingService() {
  service ??= createPublishingService({
    repo: getRepository().publishRepository,
    blob: createBlobGateway(),
    dashboardOrigin: appOrigin()
  });
  return service;
}

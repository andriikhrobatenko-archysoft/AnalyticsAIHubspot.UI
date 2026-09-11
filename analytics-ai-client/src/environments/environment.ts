export const environment = {
  production: true,
  // Absolute URL, not relative: this build is hosted on Azure Static Web Apps, a different
  // origin from the API's App Service, so every request needs the API's real hostname.
  // (We tried serving both from one App Service — see git history around ApiPipelineExtensions
  // — but backed out of it in favor of keeping the API a plain API with its own separate host.)
  apiBaseUrl: 'https://app-analyticsaihubspot-api-dev-hhcuf7f4eyh9gedp.polandcentral-01.azurewebsites.net',
};

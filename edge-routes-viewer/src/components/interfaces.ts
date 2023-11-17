export interface IModulesContent {
  $edgeAgent: {
    "properties.desired": {
      modules: object;
    }
  };
  $edgeHub: {
    "properties.desired": {
      routes: object;
    };
  };
}

export interface IDeviceTemplate {
  "$schema-template": string;
  modulesContent: IModulesContent;
}

export interface IModule {
  name: string;
  kind?: string;
}

export interface ILink {
  source: IModule | undefined;
  outTopic: string | undefined;
  target: IModule | undefined;
  inTopic: string | undefined;
  route: IRoute;
}

export interface IRoute {
  name: string;
  route: {
    from: string;
    where: string;
    into: string;
  };
}

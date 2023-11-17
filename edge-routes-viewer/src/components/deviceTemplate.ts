import _ from "lodash";
import { IRoute, ILink, IModule, IDeviceTemplate,  } from "./interfaces";

// parse device template
export const processDeviceTemplate = (deviceTemplate:IDeviceTemplate) : [IModule[], IRoute[]] => {
    const m = deviceTemplate?.modulesContent.$edgeAgent["properties.desired"].modules;
    const r = deviceTemplate?.modulesContent.$edgeHub["properties.desired"].routes;
    const routes = _.keys(r).map(k => { return {name:k, route:parseRoute(_.get(r, k) as string)} as IRoute});
    const _modules = _.union(_.keys(m).map(k => { return {name:k, ..._.get(m, k)}}));
    const missing =_.uniqBy(routes.map(r => getModuleNameFromPath(r.route.from)), _.identity).filter(d => _.findIndex(_modules, (m) => m.name === d) === -1).map(m=> {return {name:m, kind:"MISSING"}});
    const modules = _.union(_modules, missing, [{name:"[don't draw]", kind:"EMPTY"}, {name:"$upstream", kind:"IOTHUB"}]);
    return [modules, routes]
}


// create links from modules
export const getLinks = (modules: IModule[], routes: IRoute[]) : ILink[] => {
    const array:ILink[] = [];
    routes.forEach((r: IRoute, i) => {
      array.push({
        source: getLinkedModule (modules, r.route.from),
        outTopic: getTopicFromPath(r.route.from),
        target: getLinkedModule(modules, r.route.into),
        inTopic: getTopicFromPath(r.route.into),
        route: r
      });
    });
    return array;
  };

  // get linked module from route path
  export const getLinkedModule = (modules: IModule[], routePath:string) : IModule | undefined =>{
    const index =  _.findIndex(modules, (m) => routePath.indexOf(m.name) !== -1);
    if(index !== -1)
      return modules[index];
    return _.last(modules);
  };

  export const getLinkedNodes = (links: ILink[], n:string) => {
    return Array.from(new Set(
      links
        .flatMap(d => d.source?.name === n || d.target?.name === n ? [d.source, d.target] : null)
        .filter(d => d !== null)
      ));
  }


  // parse routes
  const parseRoute = (route: string) => {
    const regex = /FROM\s+([^ ]+)|WHERE\s+([^ ]+)|INTO\s+([^ ]+)/g;
    const matches = [...route.matchAll(regex)];
    const from = matches.find((match) => match[1])?.[1];
    const where = matches.find((match) => match[2])?.[2];
    const into = matches.find((match) => match[3])?.[3];
    return { from, where, into };
  };

  // get topic from route path
  const getTopicFromPath = (routePath: string) => {
    const regex = /\/(outputs|inputs)\/([^/]+)("\))?/;
    const match = routePath.match(regex);
    if (match) {
      return match[2].replace('")', '');
    }
  };

  // get module name from route path
  // TODO: this is a hack, need to find a better way to get module name from route path
  export const getModuleNameFromPath = (routePath: string) => {
    const regex = /modules\/([^/]+)(\/outputs|\/inputs)?/;
    const match = routePath.match(regex);
    if (match) {
      return match[1];
    }
    return routePath;
  };

import { registry } from '~/tools/registry'

export function useToolRegistry() {
  return {
    allTools: registry.allTools,
    allGroups: registry.groups.filter(g => !g.meta.hidden),
    findTool: registry.findTool,
    findGroup: registry.findGroup,
    resolve: registry.resolve,
    getGroupTools: registry.getGroupTools,
    getAllSlugs: registry.getAllSlugs,
  }
}

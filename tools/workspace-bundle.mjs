import fs from 'node:fs';
import path from 'node:path';

// Native esbuild traverses Windows profile ancestors that can be denied in
// restricted desktop sessions. Node reads the same authorized project files.
// All frontend imports in this project are local JavaScript modules.
export function workspaceBundle(root) {
  return { name: 'workspace-files', setup(build) {
    build.onResolve({filter: /.*/}, args => {
      if (args.kind !== 'entry-point' && !args.path.startsWith('.'))
        throw new Error('Unexpected non-local frontend import: ' + args.path);
      const file = path.resolve(args.importer ? path.dirname(path.join(root, args.importer)) : root, args.path);
      const relative = path.relative(root, file).replaceAll('\\', '/');
      if (relative.startsWith('../') || path.isAbsolute(relative)) throw new Error('Frontend import outside workspace');
      return { path: relative, namespace: 'workspace' };
    });
    build.onLoad({filter: /.*/, namespace: 'workspace'}, args => ({
      contents: fs.readFileSync(path.join(root, args.path), 'utf8'), loader: 'js'
    }));
  }};
}

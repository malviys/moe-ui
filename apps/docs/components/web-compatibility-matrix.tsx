import {
  browserProjects,
  themes,
  viewports,
  webTestManifest,
} from "@/lib/web-test-manifest";

export function WebCompatibilityMatrix() {
  return (
    <div className="not-prose my-8 space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Browsers", browserProjects.join(" · ")],
          ["Themes", themes.join(" · ")],
          ["Viewports", viewports.join(" · ")],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-fd-border bg-fd-card p-4"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-fd-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-sm font-medium capitalize">{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-fd-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-fd-muted/60">
            <tr>
              <th className="px-4 py-3 font-medium">Component</th>
              <th className="px-4 py-3 font-medium">Interaction gate</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {webTestManifest.map((component) => (
              <tr key={component.name} className="border-t border-fd-border">
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  {component.title}
                </td>
                <td className="px-4 py-3 text-fd-muted-foreground">
                  {component.behaviors.join(" · ")}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-800 dark:text-amber-300">
                    Beta gate
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

# Diagrams reference

All course diagrams live inline (Mermaid) inside their respective modules — they render directly in the VS Code Markdown preview (`Ctrl+K V`) and on GitHub. This file is just an index in case you want to re-use them.

| Diagram | Module |
|---|---|
| VMs vs Containers | [Module 1](../modules/01-containers-fundamentals.md#2-container-vs-virtual-machine) |
| Image → Container | [Module 1](../modules/01-containers-fundamentals.md#3-image-vs-container) |
| Docker client / daemon / registry | [Module 2](../modules/02-docker-basics.md#1-how-docker-is-wired-up) |
| Image layer cache flow | [Module 2](../modules/02-docker-basics.md#3-image-layers-why-order-matters) |
| Multi-stage build (builder → runtime) | [Module 4](../modules/04-multistage-builds.md#1-the-core-idea-3-min) |
| Kubernetes cluster (control plane + nodes) | [Module 6](../modules/06-kubernetes-concepts.md#2-the-kubernetes-cluster-from-10000-ft-3-min) |
| Deployment / ReplicaSet / Pod / Service | [Module 6](../modules/06-kubernetes-concepts.md#3-the-five-objects-youll-use-most-7-min) |

## Rendering tips

- VS Code: install the built-in **Markdown Preview Mermaid Support** or open the `.md` files — recent VS Code versions render Mermaid natively.
- GitHub: renders Mermaid natively in `.md` files.
- Export to PNG: use the [Mermaid Live Editor](https://mermaid.live) and paste the diagram block.

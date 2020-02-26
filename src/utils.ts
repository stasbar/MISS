import vis, { IdType, Position } from "vis-network";
import { Data, Edge } from "./simulator/fast-data";
import { v4 as uuidv4 } from "uuid";
interface NodeEdge {
  x: number;
  y: number;
  id: string;
  connections: Array<IdType | { fromId: IdType; toId: IdType }>;
}

interface ImportedNode {
  id: number;
  title: string;
  x: number;
  y: number;
  group: number;
}

function objectToArray(obj: { [nodeId: string]: Position }) {
  return Object.keys(obj).map(key => {
    obj[key]["id"] = key;
    return obj[key];
  });
}

export function exportNetwork(network: vis.Network) {
  function addConnections(elem: NodeEdge, index: number) {
    elem.connections = network.getConnectedNodes(index);
  }

  const nodes: vis.Node[] = objectToArray(network.getPositions());
  nodes.forEach(addConnections);

  const exportValue = JSON.stringify(nodes, undefined, 2);
  console.log(exportValue);
}

export function importNetwork(inputData: NodeEdge[]) {
  console.log("restore");
  /* var inputData: NodeEdge[] = JSON.parse(inputValue); */
  return new Data(getNodeData(inputData), getEdgeData(inputData));
}

function getNodeData(data: NodeEdge[]): Array<ImportedNode> {
  var networkNodes = new Array<ImportedNode>();

  data.forEach(elem => {
    networkNodes.push({
      id: Number(elem.id),
      title: elem.id,
      x: elem.x,
      y: elem.y,
      group: 0
    });
  });

  return networkNodes;
}

function getEdgeData(data: NodeEdge[]) {
  var networkEdges: Map<string, Edge> = new Map<string, Edge>();

  data.forEach((node: NodeEdge) => {
    // add the connection
    node.connections.forEach(connId => {
      const id = uuidv4();
      networkEdges.set(id, { id, from: Number(node.id), to: Number(connId) });
      let cNode = getNodeById(data, connId);

      var elementConnections = cNode.connections;

      // remove the connection from the other node to prevent duplicate connections
      var duplicateIndex = elementConnections.findIndex(connection => {
        return connection == node.id; // double equals since id can be numeric or string
      });

      if (duplicateIndex != -1) {
        elementConnections.splice(duplicateIndex, 1);
      }
    });
  });

  return networkEdges;
}

function getNodeById(
  data: NodeEdge[],
  id: IdType | { fromId: IdType; toId: IdType }
) {
  for (var n = 0; n < data.length; n++) {
    if (data[n].id == id) {
      // double equals since id can be numeric or string
      return data[n];
    }
  }

  throw "Can not find id '" + id + "' in data";
}

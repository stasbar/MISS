import vis, { IdType, Position } from "vis-network";
interface NodeEdge {
  x: number;
  y: number;
  id: string;
  connections: Array<IdType>;
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

  var data = {
    nodes: getNodeData(inputData),
    edges: getEdgeData(inputData)
  };
  return data;
}

function getNodeData(data: NodeEdge[]) {
  var networkNodes = [];

  data.forEach(elem => {
    networkNodes.push({
      id: elem.id,
      title: elem.id,
      x: elem.x,
      y: elem.y,
      group: 0
    });
  });

  return new vis.DataSet(networkNodes);
}

function getEdgeData(data: NodeEdge[]) {
  var networkEdges = [];

  data.forEach((node: NodeEdge) => {
    // add the connection
    node.connections.forEach(connId => {
      networkEdges.push({ from: node.id, to: connId });
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

  return new vis.DataSet(networkEdges);
}

function getNodeById(data: NodeEdge[], id: IdType) {
  for (var n = 0; n < data.length; n++) {
    if (data[n].id == id) {
      // double equals since id can be numeric or string
      return data[n];
    }
  }

  throw "Can not find id '" + id + "' in data";
}

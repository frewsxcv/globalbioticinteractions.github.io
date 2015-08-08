var transform = {};

parseToStructure = function (data) {
    var parsedData = {};

    data.forEach(function (d) {

        function isResolved(taxonNode) {
            return taxonNode.id && taxonNode.id !== 'no:match' && taxonNode.path !== undefined;
        }

        function addNode(taxonNode) {
            if (isResolved(taxonNode) && !parsedData[ taxonNode.id ]) {
                var path = taxonNode.path.split(' | ').join('.');
                parsedData[ taxonNode.id ] = { name: path, path: path, eolId: taxonNode.id, preys: [] };
            }
        }

        function linkNodes(source, target) {
            if (parsedData[ source.id ] && isResolved(target)) {
                var path = target.path.split(' | ').join('.');
                parsedData[ source.id ].preys.push(path);
            }
        }

        addNode(d.source);
        addNode(d.target);
        linkNodes(d.source, d.target);
    });

    var returnData = [];
    for (var id in parsedData) {
        if (parsedData.hasOwnProperty(id)) {
            returnData.push(parsedData[ id ]);
        }
    }

    return returnData;
};

function taxonHierarchy(classes) {
    var map = {};
    var j = 0;

    function find(name, data) {
        var node = map[name], i;
        if (!node) {
            node = map[name] = data || {name: name, children: []};

            if (name.length) {
                node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                if (!node.parent.children) {
                    node.parent.children = [];
                }
                node.parent.children.push(node);
                node.key = name.substring(i + 1);
            }
        }
        return node;
    }

    classes.forEach(function (d) {
        find(d.name, d);
    });
    return map[""];
}

// Return a list of preys for the given array of nodes.
function taxonPreys(nodes) {
    var map = {};
    // Compute a map from name to node.
    nodes.forEach(function (d) {
        map[d.name] = d;
    });
    // For each import, construct a link from the source to target node.
    var preys = [];
    nodes.forEach(function (d) {
        if (d.preys) d.preys.forEach(function (i) {
            if (map[ i ]) {
                preys.push({source: map[d.name], target: map[i]});
            }
        });
    });
    return preys;
}

// to enable testing testling/npm framework without converting all to npm module
if (typeof module !== 'undefined') {
    transform.parseToStructure = parseToStructure;
    transform.taxonHierarchy = taxonHierarchy;
    transform.taxonPreys = taxonPreys;
    module.exports = transform;
}
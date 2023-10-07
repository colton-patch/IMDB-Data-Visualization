import { assert } from 'chai';
import { describe, it } from 'mocha';
import GraphClass from './GraphClass.js';

// some dummy graph data
const dummyGraphData = {
    nodes: [
        {id: 'tt0111161'},
        {id: 'tt0068646'},
        {id: 'tt0468569'},
        {id: 'tt0071562'},
        {id: 'tt0069699'}
    ],
    edges: [
        {source: 'tt0111161', target: 'tt0068646'},
        {source: 'tt0068646', target: 'tt0468569'},
        {source: 'tt0468569', target: 'tt0071562'}
    ],
    nodeDegrees: {
        'tt0111161': 1,
        'tt0068646': 2,
        'tt0468569': 2,
        'tt0071562': 1,
        'tt0069699': 0
    }
};

describe('GraphClass', function() {

    describe('#computelargestConnectedComponent()', function() {
        it('should compute correct number of nodes in largestConnectedComponent for the dummy graph', function() {
            let graphInstance = new GraphClass();
            let largestComponent = []
            let numberofnodes = 0
            graphInstance.graph = dummyGraphData;
            largestComponent = graphInstance.findLargestConnectedComponent()
            console.log(largestComponent);
            numberofnodes = largestComponent.nodes.length
            assert.equal(numberofnodes, 4); 
        });
    });

    describe('#computeGraphDiameter()', function() {
        it('should compute correct graph diameter for the dummy graph', function() {
            let graphInstance = new GraphClass();
            graphInstance.graph = dummyGraphData;
            let graphDiameter = 0
            graphDiameter = graphInstance.findGraphDiameter()
            assert.equal(graphDiameter, 3); 
        });
    });
});


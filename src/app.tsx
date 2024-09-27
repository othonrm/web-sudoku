import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import "./app.css";
import { handleCheckInvalidCells, handleGenerateSudoku } from "./sudoku";
import { DataSet, Network } from "vis-network/standalone/umd/vis-network.min";

export function App() {
    const generateEmptyBoard = (sudokuWidth: number, sudokuHeight: number) => {
        const newSudoku: number[][] = [];
        for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
            newSudoku.push([]);

            for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
                newSudoku[rowIndex].push(0);
            }
        }
        return newSudoku;
    };

    // generateEmptyBoard(9, 9)
    // const [sudoku, setSudoku] = useState<number[][]>([]); // (handleGenerateSudoku());
    const [sudoku, setSudoku] = useState<number[][]>(generateEmptyBoard(9, 9));
    const [invalidCells, setInvalidCells] = useState<boolean[][]>([]);
    const [inputTargetCell, setInputTargetCell] = useState<
        [number, number] | undefined
    >();

    // const [graph, setGraph] = useState({
    //     nodes: new DataSet([]),
    //     edges: new DataSet([]),
    // });
    const graphRef = useRef({
        nodes: new DataSet([]),
        edges: new DataSet([]),
    });

    window.graphRef = graphRef;

    const visRef = useRef();

    window.visRef = visRef.current;

    // useEffect(() => {
    //     graphRef.current.nodes.add([
    //         {
    //             id: `${0}@${0}@${1}`,
    //             label: `Cell: ${1}`,
    //         },
    //         {
    //             id: `${0}@${1}@${2}`,
    //             label: `Cell: ${2}`,
    //         },
    //     ]);

    //     graphRef.current.edges.add([
    //         {
    //             from: `${0}@${0}@${1}`,
    //             to: `${0}@${1}@${2}`,
    //         },
    //     ]);
    // }, []);

    useEffect(() => {
        // create an array with nodes
        var nodes = graphRef.current.nodes;

        // create an array with edges
        var edges = graphRef.current.edges;

        // create a network
        var container = document.getElementById("vis");
        var data = {
            nodes: nodes,
            edges: edges,
        };
        var options = {
            layout: {
                hierarchical: true,
            },
            edges: {
                color: "#000000",
            },
            interaction: { hover: true },
        };
        var network = new Network(container, data, options);
        window.network = network;
    }, []);

    var events = {
        select: function (event) {
            var { nodes, edges } = event;
        },
    };

    // useEffect(() => {
    //     if (sudoku.length === 0) {
    //         let newSudoku = [];
    //         // setSudoku(handleGenerateSudoku());
    //         let count = 0;
    //         do {
    //             newSudoku = handleGenerateSudoku();
    //             count++;
    //         } while (
    //             newSudoku?.some((row) =>
    //                 row.some(
    //                     (cell) => cell === 0 || cell !== undefined
    //                     //
    //                 )
    //             )
    //         );
    //         console.log(`FOUND SUDOKU AFTER ${count} ITERATIONS`);
    //         console.log(newSudoku);
    //         setSudoku(newSudoku);
    //     }
    // }, []);

    useEffect(() => {
        handleCheckInvalidCells(sudoku, setInvalidCells);
    }, [sudoku]);

    const handleUpdateSudokuCell = (x: number, y: number, value: number) => {
        setSudoku((prev) => {
            // Replace cell with new value
            return prev.map((group, groupIndex) => {
                if (groupIndex === x) {
                    return group.map((cell, cellIndex) => {
                        if (cellIndex === y) {
                            return value;
                        }
                        return cell;
                    });
                }
                return group;
            });
        });
    };

    const handleKeyDown = useCallback(
        (ev: KeyboardEvent) => {
            console.log(inputTargetCell);
            if (Number(ev.key) > 0 && Number(ev.key) < 10 && inputTargetCell) {
                console.log("set sudoku");
                handleUpdateSudokuCell(...inputTargetCell, Number(ev.key));
            }
        },
        [inputTargetCell]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <>
            <h1>Web Sudoku</h1>
            <small>
                <p>
                    Uses a DFS backtracking approach for finding a valid sudoku
                    board.
                </p>
                <p>
                    Made by{" "}
                    <a href="https://github.com/othonrm" target="_blank">
                        @othonrm
                    </a>{" "}
                    - Sep 2024
                </p>
            </small>
            <div class="container">
                <table class="sudoku-table">
                    <tbody>
                        {sudoku.map((group, groupIndex) => {
                            return (
                                <tr
                                    class={
                                        groupIndex.toString() +
                                        (groupIndex % 3 === 0
                                            ? " initial-row"
                                            : "")
                                    }
                                    key={groupIndex}
                                >
                                    {group.map((cell, cellIndex) => (
                                        <td
                                            key={`${groupIndex}@${cellIndex}`}
                                            class={`
                                                ${cellIndex.toString()}
                                                ${
                                                    cellIndex % 3 === 0
                                                        ? " initial-column"
                                                        : ""
                                                }
                                                        ${
                                                            inputTargetCell &&
                                                            inputTargetCell[0] ===
                                                                groupIndex &&
                                                            inputTargetCell[1] ===
                                                                cellIndex
                                                                ? "target"
                                                                : false
                                                        }
                                                        ${
                                                            invalidCells[
                                                                groupIndex
                                                            ]?.[cellIndex]
                                                                ? "invalid"
                                                                : false
                                                        }
                                                `}
                                            onClick={() => {
                                                setInputTargetCell([
                                                    groupIndex,
                                                    cellIndex,
                                                ]);
                                            }}
                                        >
                                            {cell ? cell : ""}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button
                onClick={() => {
                    handleGenerateSudoku(setSudoku);
                    // TODO: this only generates the complete filled and valid board.
                    // Next steps are:
                    // - store the valid solution? not really necessary
                    // - blank out random spaces
                    // - optional: to increase difficulty,
                    //      - blank more spaces and check for less possible solutions
                    //      - the more blank spaces and the more unique the board is (like 1 solution)
                    //      - the hard it gets
                }}
            >
                Generate Sudoku
            </button>

            <small>
                <p>References:</p>
                <small>
                    <p>
                        Algorithm for generating a valid sudoku:{" "}
                        <a
                            href="https://www.codeproject.com/Articles/23206/Sudoku-Algorithm-Generates-a-Valid-Sudoku-in-0-018"
                            target="_blank"
                        >
                            https://www.codeproject.com/Articles/23206/Sudoku-Algorithm-Generates-a-Valid-Sudoku-in-0-018
                        </a>{" "}
                        <br />
                        <small>
                            The flowchart from the article above highly
                            clarifies how the entire thing should work and
                            deeply helped me understand it before reaching the
                            working solution.
                        </small>
                        <br />
                        Sudoku solving algorithms:{" "}
                        <a
                            href="https://en.wikipedia.org/wiki/Sudoku_solving_algorithms"
                            target="_blank"
                        >
                            https://en.wikipedia.org/wiki/Sudoku_solving_algorithms
                        </a>
                        <br />
                        Introduction to backtracking:{" "}
                        <a
                            href="https://www.geeksforgeeks.org/introduction-to-backtracking-2/"
                            target="_blank"
                        >
                            https://www.geeksforgeeks.org/introduction-to-backtracking-2/
                        </a>
                        <br />
                        Depth-first search:{" "}
                        <a
                            href="https://en.wikipedia.org/wiki/Depth-first_search"
                            target="_blank"
                        >
                            https://en.wikipedia.org/wiki/Depth-first_search
                        </a>
                        <br />
                        Introduction to depth-first search:{" "}
                        <a
                            href="https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/"
                            target="_blank"
                        >
                            https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/
                        </a>
                        <br />
                        How to generate Sudoku boards with unique solutions:{" "}
                        <a
                            href="https://stackoverflow.com/a/7280517"
                            target="_blank"
                        >
                            https://stackoverflow.com/a/7280517
                        </a>
                    </p>
                </small>
            </small>
            <div id="vis"></div>
        </>
    );
}

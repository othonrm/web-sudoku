import { useCallback, useEffect, useState } from "preact/hooks";
import "./app.css";
import {
    generateEmptyBoard,
    handleCheckInvalidCells,
    handleGenerateSudoku,
    handleSolveSudoku,
} from "./sudoku";
import EraserIcon from "./assets/icons/eraser.svg?react";
import { TargetedEvent } from "preact/compat";

export function App() {
    const [sudoku, setSudoku] = useState<number[][]>(generateEmptyBoard(9, 9));
    const [invalidCells, setInvalidCells] = useState<boolean[][]>([]);
    const [inputTargetCell, setInputTargetCell] = useState<
        [number, number] | undefined
    >();
    const [blanksAmount, setBlanksAmount] = useState(32);
    const [generatingBoard, setGeneratingBoard] = useState(false);

    useEffect(() => {
        handleCheckInvalidCells(sudoku, setInvalidCells);
    }, [sudoku]);

    const handleUpdateSudokuCell = useCallback(
        (x: number, y: number, value: number) => {
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
        },
        []
    );

    useEffect(() => {
        const handleKeyDown = (ev: KeyboardEvent) => {
            console.log(inputTargetCell);
            if (Number(ev.key) >= 0 && Number(ev.key) < 10 && inputTargetCell) {
                handleUpdateSudokuCell(...inputTargetCell, Number(ev.key));
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [inputTargetCell]);

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
                                                setInputTargetCell((prev) =>
                                                    prev &&
                                                    prev[0] === groupIndex &&
                                                    prev[1] === cellIndex
                                                        ? undefined
                                                        : [
                                                              groupIndex,
                                                              cellIndex,
                                                          ]
                                                );
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

            <div class="digital-numeric-input">
                {Array.from(Array(9).keys()).map((key) => (
                    <button
                        class={!inputTargetCell ? "disabled" : ""}
                        onClick={() =>
                            inputTargetCell &&
                            handleUpdateSudokuCell(...inputTargetCell, key + 1)
                        }
                    >
                        {key + 1}
                    </button>
                ))}
                <button
                    class={!inputTargetCell ? "disabled" : ""}
                    onClick={() =>
                        inputTargetCell &&
                        handleUpdateSudokuCell(...inputTargetCell, 0)
                    }
                >
                    <EraserIcon />
                </button>
            </div>

            <div>
                <input
                    type="range"
                    id="clues"
                    name="clues"
                    min="12"
                    max="64"
                    step="1"
                    onChange={(e: TargetedEvent<HTMLInputElement>) =>
                        setBlanksAmount(Number(e.currentTarget.value) || 32)
                    }
                    value={blanksAmount}
                />
                <label for="clues">
                    Difficulty
                    <br />
                    <small>
                        <small>
                            ({blanksAmount} Blanks / {81 - blanksAmount} Clues)
                            <br />
                            {Math.floor(((81 - blanksAmount) * 100) / 81)}% of
                            the board starts filled.
                        </small>
                    </small>
                </label>
            </div>
            <br />

            <button
                disabled={generatingBoard}
                aria-disabled={generatingBoard}
                onClick={async () => {
                    if (generatingBoard) {
                        return;
                    }
                    setSudoku(generateEmptyBoard(9, 9));
                    setGeneratingBoard(true);
                    let s = await handleGenerateSudoku();
                    let startingClues = blanksAmount;
                    const easierIndexes: string[] = [];
                    let minimumPossibleSolutions = 0;
                    let foundSolutions: string[] = [];
                    for (let index = 0; index < startingClues; index++) {
                        const randomRow = Math.floor(Math.random() * s.length);
                        const randomColumn = Math.floor(
                            Math.random() * s[randomRow].length
                        );

                        if (s[randomRow][randomColumn] === 0) {
                            startingClues++;
                            continue;
                        }

                        if (
                            easierIndexes.includes(
                                `${randomRow}-${randomColumn}`
                            )
                        ) {
                            continue;
                        }

                        easierIndexes.push(`${randomRow}-${randomColumn}`);

                        // Store the cell number before blanking it out
                        const cellNumber = s[randomRow][randomColumn];
                        // Take the number off
                        s[randomRow][randomColumn] = 0;
                        // Check possible solutions
                        foundSolutions = handleSolveSudoku(s);
                        // In case the possible solutions is higher than the actual set,
                        // put back the number.
                        if (
                            index > 0 &&
                            foundSolutions.length > minimumPossibleSolutions
                        ) {
                            s[randomRow][randomColumn] = cellNumber;
                        } else {
                            minimumPossibleSolutions = foundSolutions.length;
                        }
                    }
                    console.log(
                        "FINISHED GENERATING BOARD WITH FEWER SOLUTIONS POSSIBLE: ",
                        foundSolutions
                    );
                    console.log("AMOUNT OF SOLUTIONS: ", foundSolutions.length);
                    console.log(
                        "FINAL AMOUNT OF CLUES: ",
                        s.flat().filter((s) => s !== 0).length
                    );
                    setSudoku(s);
                    setGeneratingBoard(false);
                    setBlanksAmount(s.flat().filter((s) => s === 0).length);
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
        </>
    );
}

import { Dispatch, MutableRef, StateUpdater } from "preact/hooks";
import { DataSet } from "vis-data";
import { Network } from "vis-network";

export const getGroupForCell = (
    sudoku: number[][],
    cellY: number,
    cellX: number
) => {
    const groupY = Math.floor(cellY / 3);
    const groupX = Math.floor(cellX / 3);

    const group = [];
    for (let r = 0; r < 3; r++) {
        // console.log([
        //     sudoku[r + groupY * 3][0 + groupX * 3],
        //     sudoku[r + groupY * 3][1 + groupX * 3],
        //     sudoku[r + groupY * 3][2 + groupX * 3],
        // ]);
        for (let c = 0; c < 3; c++) {
            group.push(sudoku[r + groupY * 3][c + groupX * 3]);
        }
    }
    // console.log("______");
    return group;
};

export const handleCheckInvalidCells = (
    validationTarget: number[][],
    stateSetter?: Dispatch<StateUpdater<boolean[][]>>
): boolean | void => {
    if (validationTarget.length === 0) return;

    console.log("checking invalid cells");

    let newInvalidCells = new Array<boolean[]>();
    for (
        let groupIndex = 0;
        groupIndex < validationTarget.length;
        groupIndex++
    ) {
        newInvalidCells.push([]);
        for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
            let inUse = false;

            // Check row
            inUse = validationTarget[groupIndex].some(
                (cell, idx) =>
                    cell !== 0 && // Valid cell -- all cells starts with "0" being empty
                    idx !== cellIndex &&
                    validationTarget[groupIndex][cellIndex] === cell
            );

            // Check column
            inUse =
                inUse ||
                validationTarget.some(
                    (group, idx) =>
                        group[cellIndex] && // Valid cell -- all cells starts with "0" being empty
                        idx !== groupIndex &&
                        validationTarget[groupIndex][cellIndex] ===
                            group[cellIndex]
                );

            // Check group
            inUse =
                inUse ||
                getGroupForCell(validationTarget, groupIndex, cellIndex).some(
                    (value, index, arr) =>
                        arr.lastIndexOf(value) !== index &&
                        value === validationTarget[groupIndex][cellIndex]
                );

            // // Check group -- old approach, can't really tell if it works
            // inUse =
            //     inUse ||
            //     sudoku.some((group, idx) => {
            //         if (idx > 2) return false;
            //         return group.some(
            //             (cell, cellIdx) =>
            //                 cellIdx < 3 &&
            //                 idx !== groupIndex &&
            //                 cellIdx !== cellIndex &&
            //                 cell === sudoku[groupIndex][cellIndex]
            //         );
            //     });

            newInvalidCells[groupIndex].push(inUse);
        }
    }

    if (stateSetter) {
        stateSetter(newInvalidCells);
    }

    const isInvalidSudoku = newInvalidCells.some((group) =>
        group.some((cell) => cell)
    );

    if (!isInvalidSudoku) {
        console.log("VALID SUDOKU!");
    }

    return isInvalidSudoku;
};

export const handleGenerateSudoku = async (
    stateSetter?: Dispatch<StateUpdater<number[][]>>
) => {
    console.log("GENERATING SUDOKU");
    let newSudoku = new Array<number[]>();

    // Clean the sudoku
    if (stateSetter) {
        stateSetter(newSudoku);
    }

    const sudokuWidth = 9;
    const sudokuHeight = 9;

    // Fill all slots with zero, in the app zero is rendered as an empty cell
    for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
        newSudoku.push([]);

        for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
            newSudoku[rowIndex].push(0);
        }
    }

    console.log("newSudoku: ", newSudoku);

    let safetyCount = 0;
    const valveLimit = 20_000;

    // Recursive portion to attempt to fill each cell and backtrack (return one step) in case
    // it's not a valid number or reaches a dead end.
    let level = 0;
    const pickAndFillCell = async (
        recursiveTarget: number[][],
        level: number,
        previousId?: string
    ): Promise<boolean> => {
        if (safetyCount >= valveLimit) {
            throw new Error(`reached limit of iterations: ${safetyCount}`);
        }
        safetyCount++;

        const hasEmptyCell = recursiveTarget.some((row) =>
            row.some((cell) => cell === 0 || cell === undefined)
        );

        // If no empty cell is found throughout the rows,
        // the board has been successfully filled.
        // This return will bubble up till the first recursive execution,
        // which will resume the execution of the handleGenerateSudoku.
        if (!hasEmptyCell) {
            return true;
        }

        // Find first row with an empty cell (value = 0 | undefined)
        const rowWithEmptyCell = recursiveTarget.findIndex((row) =>
            row.some((cell) => cell === 0 || cell === undefined)
        );
        // Find first empty cell for that given row (value = 0 | undefined)
        const emptyCellColumn = recursiveTarget[rowWithEmptyCell].findIndex(
            (cell) => cell === 0 || cell === undefined
        );

        // Tries to fill the current empty cell with each of the numbers.
        // Each iteration of for loop will represent the creation of a new tree
        // within this level of the DFS algorithm.
        // If we reach the end of the for loop with all possibilities being invalid (return false)
        // It means the upper level is also an invalid option which kill this level,
        // goes one above and continues the iteration for that level.
        //
        // Note: as this array is not mixed/shuffled, it will always generate the same sudoku board.

        for (const numberAttempt of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
            const inUseByRow = recursiveTarget[rowWithEmptyCell].some(
                (cell, idx) =>
                    cell !== 0 &&
                    emptyCellColumn !== idx &&
                    cell === numberAttempt
            );
            const inUseByColumn = recursiveTarget.some(
                (row, idx) =>
                    idx !== rowWithEmptyCell &&
                    row[emptyCellColumn] !== 0 &&
                    row[emptyCellColumn] === numberAttempt
            );

            const inUseByGroup = getGroupForCell(
                recursiveTarget,
                rowWithEmptyCell,
                emptyCellColumn
            ).some((value) => value === numberAttempt);

            const notUsedNumber =
                !inUseByRow && !inUseByColumn && !inUseByGroup;

            let currentId;

            if (window.graphRef) {
                currentId = `${level}@${rowWithEmptyCell}@${emptyCellColumn}@${numberAttempt}`;

                if (
                    !(
                        window.graphRef as MutableRef<{
                            nodes: DataSet<never, "id">;
                            edges: DataSet<never, "id">;
                        }>
                    ).current.nodes.get(currentId)
                ) {
                    (
                        window.graphRef as MutableRef<{
                            nodes: DataSet<never, "id">;
                            edges: DataSet<never, "id">;
                        }>
                    ).current.nodes.add([
                        {
                            id: currentId,
                            label: `${numberAttempt}`,
                        },
                    ]);

                    if (previousId) {
                        (
                            window.graphRef as MutableRef<{
                                nodes: DataSet<never, "id">;
                                edges: DataSet<never, "id">;
                            }>
                        ).current.edges.add([
                            {
                                from: previousId,
                                to: currentId,
                            },
                        ]);
                    }
                }

                if (window.network) {
                    // (window.network as Network).redraw();
                }
            }

            if (notUsedNumber) {
                // Place the number and move on to the next cell
                recursiveTarget[rowWithEmptyCell][emptyCellColumn] =
                    numberAttempt;
                //

                // Uses setter for cool animation in conjunction with the promise return,
                // leads to the algorithm "slowly" trying, and filling each cell.
                if (stateSetter) {
                    stateSetter((prev) => {
                        if (prev.length === 0) {
                            prev = recursiveTarget;
                        }
                        // Replace cell with new value
                        return prev.map((group, groupIndex) => {
                            if (groupIndex === rowWithEmptyCell) {
                                return group.map((cell, cellIndex) => {
                                    if (cellIndex === emptyCellColumn) {
                                        return numberAttempt;
                                    }
                                    return cell;
                                });
                            }
                            return group;
                        });
                    });
                }

                // From this cell on, continue trying to fill the rest of the board.
                // In case of a dead end, mark this cell as empty bellow,
                // So the next recursive attempt will ignore the already filled ones,
                // And start back from the one that is empty.
                if (
                    await pickAndFillCell(recursiveTarget, level + 1, currentId)
                ) {
                    // Was able to pick a number, return true
                    // return true;
                    return new Promise((resolver) => {
                        setTimeout(() => resolver(true), 100);
                    });
                }

                // Backtrack if no valid solution found, reset the cell
                recursiveTarget[rowWithEmptyCell][emptyCellColumn] = 0;
                //
                // Uses setter for cool animation in conjunction with the promise return,
                // leads to the algorithm "slowly" backtracking if needed.
                if (stateSetter) {
                    stateSetter((prev) => {
                        if (prev.length === 0) {
                            prev = recursiveTarget;
                        }
                        // Replace cell with new value
                        return prev.map((group, groupIndex) => {
                            if (groupIndex === rowWithEmptyCell) {
                                return group.map((cell, cellIndex) => {
                                    if (cellIndex === emptyCellColumn) {
                                        return 0;
                                    }
                                    return cell;
                                });
                            }
                            return group;
                        });
                    });
                }
            }
        }

        // If no valid number could be placed, backtrack
        return new Promise((resolver) => {
            setTimeout(() => resolver(false), 100);
        });
    };

    // Try catch in case something hits the maximum call stack.
    // Not really needed now that we have the safety valve.
    try {
        await pickAndFillCell(newSudoku, level);
    } catch (error) {
        console.error(error);
    }
    console.log(`AFTER ${safetyCount} ITERATIONS`);
    console.log("FINISH -- final board = ", newSudoku);
    if (stateSetter && newSudoku) {
        stateSetter(newSudoku);
    }
    return newSudoku;
};

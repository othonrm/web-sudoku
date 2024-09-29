import { Dispatch, StateUpdater } from "preact/hooks";

export const getGroupForCell = (
    sudoku: number[][],
    cellY: number,
    cellX: number
) => {
    const groupY = Math.floor(cellY / 3);
    const groupX = Math.floor(cellX / 3);

    const group = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            group.push(sudoku[r + groupY * 3][c + groupX * 3]);
        }
    }
    return group;
};

export const handleCheckInvalidCells = (
    validationTarget: number[][],
    stateSetter?: Dispatch<StateUpdater<boolean[][]>>
): boolean | void => {
    if (validationTarget.length === 0) return;

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

            newInvalidCells[groupIndex].push(inUse);
        }
    }

    if (stateSetter) {
        stateSetter(newInvalidCells);
    }

    const isInvalidSudoku = newInvalidCells.some((group) =>
        group.some((cell) => cell)
    );

    return isInvalidSudoku;
};

export const generateEmptyBoard = (
    sudokuWidth: number,
    sudokuHeight: number
) => {
    const newSudoku: number[][] = [];
    for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
        newSudoku.push([]);

        for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
            newSudoku[rowIndex].push(0);
        }
    }
    return newSudoku;
};

export const handleGenerateSudoku = async (
    stateSetter?: Dispatch<StateUpdater<number[][]>>
) => {
    console.log("GENERATING SUDOKU");

    // Clean the sudoku
    let newSudoku = generateEmptyBoard(9, 9);
    if (stateSetter) {
        stateSetter(newSudoku);
    }

    let safetyCount = 0;
    const valveLimit = 20_000;

    // Recursive portion to attempt to fill each cell and backtrack (return one step) in case
    // it's not a valid number or reaches a dead end.
    const pickAndFillCell = async (
        recursiveTarget: number[][]
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
        const possibleNumbers = Array.from(Array(9).keys());
        for (let index = 0; index < 9; index++) {
            // Pick random numbers from 1 to 9 that weren't used yet.
            // It seems to solve faster than always trying
            // With the same ascending order [1,2,3,4,5,6,7,8,9].
            const randomIndex = Math.floor(
                Math.random() * possibleNumbers.length
            );
            const numberAttempt = possibleNumbers[randomIndex] + 1;
            possibleNumbers.splice(randomIndex, 1);

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
                if (await pickAndFillCell(recursiveTarget)) {
                    // Was able to pick a number, return true
                    // return true;
                    return new Promise((resolver) => {
                        setTimeout(() => resolver(true), stateSetter ? 10 : 0);
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
            setTimeout(() => resolver(false), stateSetter ? 10 : 0);
        });
    };

    // Try catch in case something hits the maximum call stack.
    // Not really needed now that we have the safety valve.
    try {
        await pickAndFillCell(newSudoku);
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

export const handleSolveSudoku = (targetBoard: number[][]): string[] => {
    // Copy the targetBoard using JSON.
    // Ensures we are not just referencing it,
    // this allows us to apply or not the found solution at the end.
    let tempBoard = JSON.parse(JSON.stringify(targetBoard));
    console.log("SOLVING SUDOKU");

    let solution: number[] = [];
    const foundSolutions: string[] = [];

    let safetyCount = 0;
    const valveLimit = 10_000_000;

    const pickAndFillCell = (recursiveTarget: number[][]): boolean => {
        if (safetyCount >= valveLimit) {
            throw new Error(`reached limit of iterations: ${safetyCount}`);
        }
        safetyCount++;

        const hasEmptyCell = recursiveTarget.some((row) =>
            row.some((cell) => cell === 0 || cell === undefined)
        );

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

        const possibleNumbers = Array.from(Array(9).keys());
        for (let index = 0; index < 9; index++) {
            // Pick random numbers from 1 to 9 that weren't used yet.
            // It seems to solve faster than always trying
            // With the same ascending order [1,2,3,4,5,6,7,8,9].
            const randomIndex = Math.floor(
                Math.random() * possibleNumbers.length
            );
            const numberAttempt = possibleNumbers[randomIndex] + 1;
            possibleNumbers.splice(randomIndex, 1);

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

            if (notUsedNumber) {
                recursiveTarget[rowWithEmptyCell][emptyCellColumn] =
                    numberAttempt;
                solution.push(numberAttempt);

                if (pickAndFillCell(recursiveTarget)) {
                    return true;
                }

                recursiveTarget[rowWithEmptyCell][emptyCellColumn] = 0;
                solution.pop();
            }
        }

        return false;
    };

    let attemptAccumulator = 0;

    let solutionTries = 0;

    const findManySolutions = () => {
        solutionTries++;

        // Reset the counter for each solution recursive search
        attemptAccumulator += safetyCount;
        safetyCount = 0;
        pickAndFillCell(tempBoard);

        const solutionString = solution.join("-");
        if (!foundSolutions.includes(solutionString)) {
            foundSolutions.push(solutionString);
        }

        if (solutionTries < 1_000) {
            solution = [];
            tempBoard = JSON.parse(JSON.stringify(targetBoard));
            findManySolutions();
        } else {
            return;
        }
    };

    findManySolutions();

    if (handleCheckInvalidCells(tempBoard)) {
        console.log(
            "FINISH SOLVING - But with invalid or incomplete solution :'("
        );
        return [];
    }
    return foundSolutions;
};

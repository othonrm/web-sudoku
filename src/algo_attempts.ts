import { Dispatch, StateUpdater } from "preact/hooks";

export const handleCheckInvalidCells = (
    validationTarget: number[][],
    stateSetter?: Dispatch<StateUpdater<boolean[][]>>
): boolean | void => {
    console.log("sudoku length: ", validationTarget.length);

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

            // // Check group
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

// v0
// const handleGenerateSudoku = async () => {
//     let newSudoku = new Array<number[]>();
//     for (let groupIndex = 0; groupIndex < 9; groupIndex++) {
//         const possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

//         newSudoku.push([]);
//         for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
//             let countOfCall = 0;
//             const recursiveGetUnusedRandomNumber = () => {
//                 // console.log("recursiveGetUnusedRandomNumber");
//                 let inUse = false;
//                 let randomPosition = Math.floor(
//                     Math.random() * possibleNumbers.length
//                 );
//                 // console.log("randomPosition: ", randomPosition);
//                 const cellNumber = possibleNumbers[randomPosition];
//                 // Check row
//                 // let inUse = newSudoku[groupIndex].some(
//                 //     (cell) => cell === randomPosition
//                 // );

//                 // Check column
//                 inUse =
//                     inUse ||
//                     newSudoku.some((group, idx) => {
//                         const a =
//                             idx !== groupIndex &&
//                             group[cellIndex] === cellNumber;

//                         // if (a) {
//                         //     console.log(
//                         //         `${cellNumber} is in use in column ${cellIndex} of group ${groupIndex}`
//                         //     );
//                         // }
//                         return a;
//                     });

//                 if (inUse || handleCheckInvalidCells(newSudoku, true)) {
//                     return recursiveGetUnusedRandomNumber();
//                 }
//                 possibleNumbers.splice(randomPosition, 1);
//                 return cellNumber;
//             };
//             console.log("countOfCall: ", countOfCall);

//             const randomNumber = recursiveGetUnusedRandomNumber();

//             newSudoku[groupIndex].push(randomNumber);
//             console.log("newSudoku: ", newSudoku);
//             setSudoku(newSudoku);
//         }
//     }
// };

// v0.1;
// export const handleGenerateSudoku = () => {
//     let newSudoku = new Array<number[]>();
//     try {
//         for (let groupIndex = 0; groupIndex < 9; groupIndex++) {
//             const possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

//             newSudoku.push([]);
//             for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
//                 let countOfCall = 0;
//                 const recursiveGetUnusedRandomNumber = () => {
//                     // console.log("recursiveGetUnusedRandomNumber");
//                     let inUse = false;
//                     let randomPosition = Math.floor(
//                         Math.random() * possibleNumbers.length
//                     );
//                     // console.log("randomPosition: ", randomPosition);
//                     const cellNumber = possibleNumbers[randomPosition];
//                     // Check row
//                     // let inUse = newSudoku[groupIndex].some(
//                     //     (cell) => cell === randomPosition
//                     // );

//                     // Check column
//                     inUse =
//                         inUse ||
//                         newSudoku.some((group, idx) => {
//                             const a =
//                                 idx !== groupIndex &&
//                                 group[cellIndex] === cellNumber;

//                             // if (a) {
//                             //     console.log(
//                             //         `${cellNumber} is in use in column ${cellIndex} of group ${groupIndex}`
//                             //     );
//                             // }
//                             return a;
//                         });

//                     if (inUse || handleCheckInvalidCells(newSudoku)) {
//                         return recursiveGetUnusedRandomNumber();
//                     }
//                     possibleNumbers.splice(randomPosition, 1);
//                     return cellNumber;
//                 };
//                 console.log("countOfCall: ", countOfCall);

//                 const randomNumber = recursiveGetUnusedRandomNumber();

//                 newSudoku[groupIndex].push(randomNumber);
//                 console.log("newSudoku: ", newSudoku);
//             }
//         }
//     } catch (error) {
//         console.error("Error in handleGenerateSudoku: ", error);
//     }
//     return newSudoku;
// };

// v0.2;
// export const handleGenerateSudoku = (
//     stateSetter?: Dispatch<StateUpdater<number[][]>>
// ) => {
//     let newSudoku = new Array<number[]>();

//     if (stateSetter) {
//         stateSetter(newSudoku);
//     }

//     const sudokuWidth = 9;
//     const sudokuHeight = 9;

//     // Fill in empty slots with 0
//     for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
//         newSudoku.push([]);

//         for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
//             newSudoku[rowIndex].push(0);
//         }
//     }

//     const cellAmount = sudokuWidth * sudokuHeight;
//     const missingIndexes = Array.from(Array(cellAmount).keys());

//     for (let index = 0; index < cellAmount; index++) {
//         const randomPosition = Math.floor(
//             Math.random() * missingIndexes.length
//         );
//         const cellIndex = missingIndexes[randomPosition];

//         const cellRow = Math.floor(cellIndex / sudokuWidth);
//         const cellColumn = cellIndex - Math.floor(cellRow * sudokuWidth);

//         let countOfCall = 0;
//         // console.log("__________");
//         // console.log("cellRow: ", cellRow);
//         // console.log("cellColumn: ", cellColumn);

//         const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((num) => {
//             const inUseByRow = newSudoku[cellRow].some(
//                 (cell, idx) => cell !== 0 && cellColumn !== idx && cell === num
//             );
//             return !inUseByRow;
//         });

//         console.log(availableNumbers);

//         const recursiveGetUnusedRandomNumber = () => {
//             // console.log("recursiveGetUnusedRandomNumber");
//             let inUse = false;
//             let randomNum = Math.floor(Math.random() * sudokuWidth) + 1;

//             // Check row
//             inUse =
//                 inUse ||
//                 newSudoku[cellRow].some(
//                     (cell, idx) =>
//                         cell !== 0 && cellColumn !== idx && cell === randomNum
//                 );

//             // if (inUse) {
//             //     alert(`${randomNum} in use by x: ${cellColumn} x: ${cellRow}`);
//             // }

//             // Check column
//             // inUse =
//             //     inUse ||
//             //     newSudoku.some((row, rowIdx) => {
//             //         const a =
//             //             row[cellColumn] !== 0 &&
//             //             rowIdx !== cellRow &&
//             //             row[cellColumn] === randomNum;

//             //         if (a) {
//             //             console.log(
//             //                 `${randomNum} is in use in column ${cellColumn} of row ${rowIdx}`,
//             //                 `for filling column ${cellColumn} of row ${cellRow}`
//             //             );
//             //         }
//             //         return a;
//             //     });

//             if (inUse) {
//                 // if (handleCheckInvalidCells(newSudoku)) {
//                 return recursiveGetUnusedRandomNumber();
//             }
//             return randomNum;
//         };
//         console.log("countOfCall: ", countOfCall);

//         const randomNumber = recursiveGetUnusedRandomNumber();

//         newSudoku[cellRow][cellColumn] = randomNumber;
//         missingIndexes.splice(randomPosition, 1);

//         // Temporary "animation" thing
//         // if (stateSetter) {
//         //     setTimeout(() => {
//         //         stateSetter((prev) => {
//         //             if (prev.length === 0) {
//         //                 prev = newSudoku;
//         //             }
//         //             // Replace cell with new value
//         //             return prev.map((group, groupIndex) => {
//         //                 if (groupIndex === cellRow) {
//         //                     return group.map((cell, cellIndex) => {
//         //                         if (cellIndex === cellColumn) {
//         //                             return randomNumber;
//         //                         }
//         //                         return cell;
//         //                     });
//         //                 }
//         //                 return group;
//         //             });
//         //         });
//         //     }, 25 * index);
//         // }
//     }

//     // try {
//     //     for (let groupIndex = 0; groupIndex < 9; groupIndex++) {
//     //         const possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

//     //         newSudoku.push([]);
//     //         for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
//     //             let countOfCall = 0;
//     //             const recursiveGetUnusedRandomNumber = () => {
//     //                 // console.log("recursiveGetUnusedRandomNumber");
//     //                 let inUse = false;
//     //                 let randomPosition = Math.floor(
//     //                     Math.random() * possibleNumbers.length
//     //                 );
//     //                 // console.log("randomPosition: ", randomPosition);
//     //                 const cellNumber = possibleNumbers[randomPosition];
//     //                 // Check row
//     //                 // let inUse = newSudoku[groupIndex].some(
//     //                 //     (cell) => cell === randomPosition
//     //                 // );

//     //                 // Check column
//     //                 inUse =
//     //                     inUse ||
//     //                     newSudoku.some((group, idx) => {
//     //                         const a =
//     //                             idx !== groupIndex &&
//     //                             group[cellIndex] === cellNumber;

//     //                         // if (a) {
//     //                         //     console.log(
//     //                         //         `${cellNumber} is in use in column ${cellIndex} of group ${groupIndex}`
//     //                         //     );
//     //                         // }
//     //                         return a;
//     //                     });

//     //                 if (inUse || handleCheckInvalidCells(newSudoku)) {
//     //                     return recursiveGetUnusedRandomNumber();
//     //                 }
//     //                 possibleNumbers.splice(randomPosition, 1);
//     //                 return cellNumber;
//     //             };
//     //             console.log("countOfCall: ", countOfCall);

//     //             const randomNumber = recursiveGetUnusedRandomNumber();

//     //             newSudoku[groupIndex].push(randomNumber);
//     //             console.log("newSudoku: ", newSudoku);
//     //         }
//     //     }
//     // } catch (error) {
//     //     console.error("Error in handleGenerateSudoku: ", error);
//     // }
//     console.log("FINISH!");
//     return newSudoku;
// };

// v0.3
// export const handleGenerateSudoku = (
//     stateSetter?: Dispatch<StateUpdater<number[][]>>
// ) => {
//     let newSudoku = new Array<number[]>();

//     if (stateSetter) {
//         stateSetter(newSudoku);
//     }

//     const sudokuWidth = 9;
//     const sudokuHeight = 9;

//     // Fill in empty slots with 0
//     for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
//         newSudoku.push([]);

//         for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
//             newSudoku[rowIndex].push(0);
//         }
//     }

//     const cellAmount = sudokuWidth * sudokuHeight;
//     const missingIndexes = Array.from(Array(cellAmount).keys());

//     for (let index = 0; index < cellAmount; index++) {
//         const randomPosition = Math.floor(
//             Math.random() * missingIndexes.length
//         );
//         const cellIndex = missingIndexes[randomPosition];

//         const cellRow = Math.floor(cellIndex / sudokuWidth);
//         const cellColumn = cellIndex - Math.floor(cellRow * sudokuWidth);

//         let countOfCall = 0;
//         // console.log("__________");
//         // console.log("cellRow: ", cellRow);
//         // console.log("cellColumn: ", cellColumn);

//         const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((num) => {
//             const inUseByRow = newSudoku[cellRow].some(
//                 (cell, idx) => cell !== 0 && cellColumn !== idx && cell === num
//             );
//             const inUseByColumn = newSudoku.some(
//                 (group, idx) =>
//                     idx !== cellRow &&
//                     group[cellColumn] !== 0 &&
//                     group[cellColumn] === num
//             );
//             return !inUseByRow && !inUseByColumn;
//         });

//         const randomIndex = Math.floor(Math.random() * availableNumbers.length);
//         console.log("randomIndex: ", randomIndex);
//         const randomNumber = availableNumbers[randomIndex];

//         if (randomNumber === undefined) {
//             console.log(
//                 "undefined for index: ",
//                 randomIndex,
//                 " / but length of: ",
//                 availableNumbers.length
//             );
//         }
//         // console.log(availableNumbers);

//         // const recursiveGetUnusedRandomNumber = () => {
//         //     // console.log("recursiveGetUnusedRandomNumber");
//         //     let inUse = false;
//         //     let randomNum = Math.floor(Math.random() * availableNumbers.length) + 1;

//         //     // Check row
//         //     inUse =
//         //         inUse ||
//         //         newSudoku[cellRow].some(
//         //             (cell, idx) =>
//         //                 cell !== 0 && cellColumn !== idx && cell === randomNum
//         //         );

//         //     // if (inUse) {
//         //     //     alert(`${randomNum} in use by x: ${cellColumn} x: ${cellRow}`);
//         //     // }

//         //     // Check column
//         //     // inUse =
//         //     //     inUse ||
//         //     //     newSudoku.some((row, rowIdx) => {
//         //     //         const a =
//         //     //             row[cellColumn] !== 0 &&
//         //     //             rowIdx !== cellRow &&
//         //     //             row[cellColumn] === randomNum;

//         //     //         if (a) {
//         //     //             console.log(
//         //     //                 `${randomNum} is in use in column ${cellColumn} of row ${rowIdx}`,
//         //     //                 `for filling column ${cellColumn} of row ${cellRow}`
//         //     //             );
//         //     //         }
//         //     //         return a;
//         //     //     });

//         //     if (inUse) {
//         //         // if (handleCheckInvalidCells(newSudoku)) {
//         //         return recursiveGetUnusedRandomNumber();
//         //     }
//         //     return randomNum;
//         // };
//         // console.log("countOfCall: ", countOfCall);

//         // const randomNumber = recursiveGetUnusedRandomNumber();

//         // newSudoku[cellRow][cellColumn] = randomNumber;
//         missingIndexes.splice(randomPosition, 1);

//         // Temporary "animation" thing
//         if (stateSetter) {
//             setTimeout(() => {
//                 stateSetter((prev) => {
//                     if (prev.length === 0) {
//                         prev = newSudoku;
//                     }
//                     // Replace cell with new value
//                     return prev.map((group, groupIndex) => {
//                         if (groupIndex === cellRow) {
//                             return group.map((cell, cellIndex) => {
//                                 if (cellIndex === cellColumn) {
//                                     return randomNumber;
//                                 }
//                                 return cell;
//                             });
//                         }
//                         return group;
//                     });
//                 });
//             }, 25 * index);
//         }
//     }

//     // try {
//     //     for (let groupIndex = 0; groupIndex < 9; groupIndex++) {
//     //         const possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

//     //         newSudoku.push([]);
//     //         for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
//     //             let countOfCall = 0;
//     //             const recursiveGetUnusedRandomNumber = () => {
//     //                 // console.log("recursiveGetUnusedRandomNumber");
//     //                 let inUse = false;
//     //                 let randomPosition = Math.floor(
//     //                     Math.random() * possibleNumbers.length
//     //                 );
//     //                 // console.log("randomPosition: ", randomPosition);
//     //                 const cellNumber = possibleNumbers[randomPosition];
//     //                 // Check row
//     //                 // let inUse = newSudoku[groupIndex].some(
//     //                 //     (cell) => cell === randomPosition
//     //                 // );

//     //                 // Check column
//     //                 inUse =
//     //                     inUse ||
//     //                     newSudoku.some((group, idx) => {
//     //                         const a =
//     //                             idx !== groupIndex &&
//     //                             group[cellIndex] === cellNumber;

//     //                         // if (a) {
//     //                         //     console.log(
//     //                         //         `${cellNumber} is in use in column ${cellIndex} of group ${groupIndex}`
//     //                         //     );
//     //                         // }
//     //                         return a;
//     //                     });

//     //                 if (inUse || handleCheckInvalidCells(newSudoku)) {
//     //                     return recursiveGetUnusedRandomNumber();
//     //                 }
//     //                 possibleNumbers.splice(randomPosition, 1);
//     //                 return cellNumber;
//     //             };
//     //             console.log("countOfCall: ", countOfCall);

//     //             const randomNumber = recursiveGetUnusedRandomNumber();

//     //             newSudoku[groupIndex].push(randomNumber);
//     //             console.log("newSudoku: ", newSudoku);
//     //         }
//     //     }
//     // } catch (error) {
//     //     console.error("Error in handleGenerateSudoku: ", error);
//     // }
//     console.log("FINISH!");
//     return newSudoku;
// };

// v0.4
// export const handleGenerateSudoku = (
//     stateSetter?: Dispatch<StateUpdater<number[][]>>
// ) => {
//     let newSudoku = new Array<number[]>();

//     if (stateSetter) {
//         stateSetter(newSudoku);
//     }

//     const sudokuWidth = 9;
//     const sudokuHeight = 9;

//     // Fill in empty slots with 0
//     for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
//         newSudoku.push([]);

//         for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
//             newSudoku[rowIndex].push(0);
//         }
//     }

//     const cellAmount = sudokuWidth * sudokuHeight;
//     const missingIndexes = Array.from(Array(cellAmount).keys());

//     for (let index = 0; index < cellAmount; index++) {
//         // const randomPosition = Math.floor(
//         //     Math.random() * missingIndexes.length
//         // );
//         // const cellIndex = missingIndexes[randomPosition];
//         const randomPosition = index;
//         const cellIndex = index;

//         const cellRow = Math.floor(cellIndex / sudokuWidth);
//         const cellColumn = cellIndex - Math.floor(cellRow * sudokuWidth);

//         const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((num) => {
//             const inUseByRow = newSudoku[cellRow].some(
//                 (cell, idx) => cell !== 0 && cellColumn !== idx && cell === num
//             );
//             const inUseByColumn = newSudoku.some(
//                 (row, idx) =>
//                     idx !== cellRow &&
//                     row[cellColumn] !== 0 &&
//                     row[cellColumn] === num
//             );

//             const inUseByGroup = getGroupForCell(
//                 newSudoku,
//                 cellRow,
//                 cellColumn
//             ).some(
//                 (value, index, arr) =>
//                     arr.lastIndexOf(value) !== index && value === num
//             );

//             return !inUseByRow && !inUseByColumn && !inUseByGroup;
//         });

//         const randomIndex = Math.floor(Math.random() * availableNumbers.length);
//         // console.log("randomIndex: ", randomIndex);
//         const randomNumber = availableNumbers[randomIndex];

//         if (randomNumber === undefined) {
//             // console.log(
//             //     "undefined for index: ",
//             //     randomIndex,
//             //     " / but length of: ",
//             //     availableNumbers.length
//             // );
//         }

//         missingIndexes.splice(randomPosition, 1);

//         // Temporary "animation" thing
//         // if (stateSetter) {
//         //     setTimeout(() => {
//         //         stateSetter((prev) => {
//         //             if (prev.length === 0) {
//         //                 prev = newSudoku;
//         //             }
//         //             // Replace cell with new value
//         //             return prev.map((group, groupIndex) => {
//         //                 if (groupIndex === cellRow) {
//         //                     return group.map((cell, cellIndex) => {
//         //                         if (cellIndex === cellColumn) {
//         //                             return randomNumber;
//         //                         }
//         //                         return cell;
//         //                     });
//         //                 }
//         //                 return group;
//         //             });
//         //         });
//         //     }, 25 * index);
//         // } else {
//         // }
//         newSudoku[cellRow][cellColumn] = randomNumber;
//     }

//     console.log("FINISH!");
//     return newSudoku;
// };

// v0.5
// export const handleGenerateSudoku = (
//     stateSetter?: Dispatch<StateUpdater<number[][]>>
// ) => {
//     let newSudoku = new Array<number[]>();

//     if (stateSetter) {
//         stateSetter(newSudoku);
//     }

//     const sudokuWidth = 9;
//     const sudokuHeight = 9;

//     // Fill in empty slots with 0
//     for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
//         newSudoku.push([]);

//         for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
//             newSudoku[rowIndex].push(0);
//         }
//     }

//     const cellAmount = sudokuWidth * sudokuHeight;
//     const missingIndexes = Array.from(Array(cellAmount).keys());

//     for (let index = 0; index < cellAmount; index++) {
//         // const randomPosition = Math.floor(
//         //     Math.random() * missingIndexes.length
//         // );
//         // const cellIndex = missingIndexes[randomPosition];
//         const randomPosition = index;
//         const cellIndex = index;

//         const cellRow = Math.floor(cellIndex / sudokuWidth);
//         const cellColumn = cellIndex - Math.floor(cellRow * sudokuWidth);

//         const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((num) => {
//             const inUseByRow = newSudoku[cellRow].some(
//                 (cell, idx) => cell !== 0 && cellColumn !== idx && cell === num
//             );
//             const inUseByColumn = newSudoku.some(
//                 (row, idx) =>
//                     idx !== cellRow &&
//                     row[cellColumn] !== 0 &&
//                     row[cellColumn] === num
//             );

//             const inUseByGroup = getGroupForCell(
//                 newSudoku,
//                 cellRow,
//                 cellColumn
//             ).some((value) => value === num);

//             return !inUseByRow && !inUseByColumn && !inUseByGroup;
//         });

//         const randomIndex = Math.floor(Math.random() * availableNumbers.length);
//         // console.log("randomIndex: ", randomIndex);
//         const randomNumber = availableNumbers[randomIndex];

//         if (randomNumber === undefined) {
//             // console.log(
//             //     "undefined for index: ",
//             //     randomIndex,
//             //     " / but length of: ",
//             //     availableNumbers.length
//             // );
//             // console.log("DEAD END");
//             return newSudoku;
//         }

//         missingIndexes.splice(randomPosition, 1);

//         // Temporary "animation" thing
//         // if (stateSetter) {
//         //     setTimeout(() => {
//         //         stateSetter((prev) => {
//         //             if (prev.length === 0) {
//         //                 prev = newSudoku;
//         //             }
//         //             // Replace cell with new value
//         //             return prev.map((group, groupIndex) => {
//         //                 if (groupIndex === cellRow) {
//         //                     return group.map((cell, cellIndex) => {
//         //                         if (cellIndex === cellColumn) {
//         //                             return randomNumber;
//         //                         }
//         //                         return cell;
//         //                     });
//         //                 }
//         //                 return group;
//         //             });
//         //         });
//         //     }, 25 * index);
//         // } else {
//         // }
//         newSudoku[cellRow][cellColumn] = randomNumber;
//     }

//     console.log("FINISH!");
//     return newSudoku;
// };

//  v1 -- Finally working, after 3 days :') -- (first recursive approach)
// export const handleGenerateSudoku = async (
//     stateSetter?: Dispatch<StateUpdater<number[][]>>
// ) => {
//     console.log("GENERATING SUDOKU");
//     let newSudoku = new Array<number[]>();

//     // Clean the sudoku
//     if (stateSetter) {
//         stateSetter(newSudoku);
//     }

//     const sudokuWidth = 9;
//     const sudokuHeight = 9;

//     const cellAmount = sudokuWidth * sudokuHeight;

//     // Fill all slots with zero, in the app zero is rendered as an empty cell
//     for (let rowIndex = 0; rowIndex < sudokuWidth; rowIndex++) {
//         newSudoku.push([]);

//         for (let cellIndex = 0; cellIndex < sudokuHeight; cellIndex++) {
//             newSudoku[rowIndex].push(0);
//         }
//     }

//     console.log("newSudoku: ", newSudoku);

//     let safetyCount = 0;
//     const valveLimit = 20_000;

//     // Recursive portion to attempt to fill each cell and backtrack (return one step) in case
//     // it's not a valid number or reaches a dead end.
//     const pickAndFillCell = async (
//         recursiveTarget: number[][]
//     ): Promise<boolean> => {
//         if (safetyCount >= valveLimit) {
//             throw new Error(`reached limit of iterations: ${safetyCount}`);
//         }
//         safetyCount++;

//         const hasEmptyCell = recursiveTarget.some((row) =>
//             row.some((cell) => cell === 0 || cell === undefined)
//         );

//         // If no empty cell is found throughout the rows,
//         // the board has been successfully filled.
//         // This return will bubble up till the first recursive execution,
//         // which will resume the execution of the handleGenerateSudoku.
//         if (!hasEmptyCell) {
//             return true;
//         }

//         // Find first row with an empty cell (value = 0 | undefined)
//         const rowWithEmptyCell = recursiveTarget.findIndex((row) =>
//             row.some((cell) => cell === 0 || cell === undefined)
//         );
//         // Find first empty cell for that given row (value = 0 | undefined)
//         const emptyCellColumn = recursiveTarget[rowWithEmptyCell].findIndex(
//             (cell) => cell === 0 || cell === undefined
//         );

//         // Tries to fill the current empty cell with each of the numbers.
//         // Each iteration of for loop will represent the creation of a new tree
//         // within this level of the DFS algorithm.
//         // If we reach the end of the for loop with all possibilities being invalid (return false)
//         // It means the upper level is also an invalid option which kill this level,
//         // goes one above and continues the iteration for that level.
//         //
//         // Note: as this array is not mixed/shuffled, it will always generate the same sudoku board.
//         for (const numberAttempt of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
//             const inUseByRow = recursiveTarget[rowWithEmptyCell].some(
//                 (cell, idx) =>
//                     cell !== 0 &&
//                     emptyCellColumn !== idx &&
//                     cell === numberAttempt
//             );
//             const inUseByColumn = recursiveTarget.some(
//                 (row, idx) =>
//                     idx !== rowWithEmptyCell &&
//                     row[emptyCellColumn] !== 0 &&
//                     row[emptyCellColumn] === numberAttempt
//             );

//             const inUseByGroup = getGroupForCell(
//                 recursiveTarget,
//                 rowWithEmptyCell,
//                 emptyCellColumn
//             ).some((value) => value === numberAttempt);

//             const notUsedNumber =
//                 !inUseByRow && !inUseByColumn && !inUseByGroup;

//             if (notUsedNumber) {
//                 // Place the number and move on to the next cell
//                 recursiveTarget[rowWithEmptyCell][emptyCellColumn] =
//                     numberAttempt;
//                 //
//                 // Uses setter for cool animation in conjunction with the promise return,
//                 // leads to the algorithm "slowly" trying, and filling each cell.
//                 if (stateSetter) {
//                     stateSetter((prev) => {
//                         if (prev.length === 0) {
//                             prev = recursiveTarget;
//                         }
//                         // Replace cell with new value
//                         return prev.map((group, groupIndex) => {
//                             if (groupIndex === rowWithEmptyCell) {
//                                 return group.map((cell, cellIndex) => {
//                                     if (cellIndex === emptyCellColumn) {
//                                         return numberAttempt;
//                                     }
//                                     return cell;
//                                 });
//                             }
//                             return group;
//                         });
//                     });
//                 }

//                 // From this cell on, continue trying to fill the rest of the board.
//                 // In case of a dead end, mark this cell as empty bellow,
//                 // So the next recursive attempt will ignore the already filled ones,
//                 // And start back from the one that is empty.
//                 if (await pickAndFillCell(recursiveTarget)) {
//                     // Was able to pick a number, return true
//                     // return true;
//                     return new Promise((resolver) => {
//                         setTimeout(() => resolver(true), 10);
//                     });
//                 }

//                 // Backtrack if no valid solution found, reset the cell
//                 recursiveTarget[rowWithEmptyCell][emptyCellColumn] = 0;
//                 //
//                 // Uses setter for cool animation in conjunction with the promise return,
//                 // leads to the algorithm "slowly" backtracking if needed.
//                 if (stateSetter) {
//                     stateSetter((prev) => {
//                         if (prev.length === 0) {
//                             prev = recursiveTarget;
//                         }
//                         // Replace cell with new value
//                         return prev.map((group, groupIndex) => {
//                             if (groupIndex === rowWithEmptyCell) {
//                                 return group.map((cell, cellIndex) => {
//                                     if (cellIndex === emptyCellColumn) {
//                                         return 0;
//                                     }
//                                     return cell;
//                                 });
//                             }
//                             return group;
//                         });
//                     });
//                 }
//             }
//         }

//         // If no valid number could be placed, backtrack
//         return new Promise((resolver) => {
//             setTimeout(() => resolver(false), 10);
//         });
//     };

//     // Try catch in case something hits the maximum call stack.
//     // Not really needed now that we have the safety valve.
//     try {
//         await pickAndFillCell(newSudoku);
//     } catch (error) {
//         console.error(error);
//     }
//     console.log(`AFTER ${safetyCount} ITERATIONS`);
//     console.log("FINISH -- final board = ", newSudoku);
//     if (stateSetter && newSudoku) {
//         stateSetter(newSudoku);
//     }
//     return newSudoku;
// };

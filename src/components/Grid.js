import React, { useState } from "react";
import Square from "./Square";
import "./Grid.css";
import mySleep from "./Service";

function Grid(props) {

    const MAX = 9999999999;
    const n_rows = props.rows;
    const n_cols = props.cols;



    const [grid, setGrid] = useState(createSearchGrid());
    const [setting_start_mode, setSettingStartMode] = useState(false);
    const [setting_dest_mode, setSettingDestMode] = useState(false);
    const [setting_blocks_mode, setSettingBlocksMode] = useState(false);
    const [cursor, setCursor] = useState('auto');
    const [force_render, setForceRender] = useState(false);
    const [calculation_mode, setCalculationMode] = useState(false);

    const [start_sq, setStartSq] = useState({});
    const [dest_sq, setDestSq] = useState({});
    const [block_squares, setBlockSquares] = useState([]);
    const [mousePressed, setMousePressed] = useState(false);


    function createSearchGrid() {
        let new_grid = new Array(n_rows); // create an empty array of length n
        for (let i = 0; i < n_rows; i++) {
            new_grid[i] = new Array(n_cols); // make each element an array
        }

        for (let i = 0; i < n_rows; i++) {
            for (let j = 0; j < n_cols; j++) {
                var unique_id = i * n_cols + j;
                new_grid[i][j] = {
                    id: unique_id,
                    row_index: i,
                    col_index: j,
                    start_point: false,
                    dest_point: false,
                    is_block: false,
                    visited: false,
                    in_shortest_path: false,
                    dist: MAX, //distance from start point
                    cost: 0,
                    prev: {}
                }
            }
        }

        return new_grid
    }



    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function update_rendering() {
        setForceRender(!force_render);
    }



    function set_start_point() {
        setSettingStartMode(true);
        setCursor("pointer");

    }


    function handle_sq_click(elem) {

        if (calculation_mode)
            return;

        if (setting_start_mode) {

            grid[elem.row_index][elem.col_index].start_point = true;
            grid[elem.row_index][elem.col_index].dist = 0;
            setStartSq(grid[elem.row_index][elem.col_index]);
            console.log("@@ start_sq: " + start_sq)
            document.getElementById(elem.id).style.backgroundColor = "yellow";
            setSettingStartMode(false);
            setSettingDestMode(true);
            setCursor("crosshair")

            return;
        }

        if (setting_dest_mode && elem.id !== start_sq.id) {
            grid[elem.row_index][elem.col_index].dest_point = true;
            setDestSq(grid[elem.row_index][elem.col_index]);
            document.getElementById(elem.id).style.backgroundColor = "red";
            setSettingDestMode(false);
            setCursor("auto");
            setSettingBlocksMode(true);
            return;
        }

        if (setting_blocks_mode && elem.id !== start_sq.id && elem.id !== dest_sq.id) {
            grid[elem.row_index][elem.col_index].is_block = true;
            var temp_blocks_squares = block_squares;
            temp_blocks_squares.push(grid[elem.row_index][elem.col_index])
            setBlockSquares(temp_blocks_squares);
            document.getElementById(elem.id).style.backgroundColor = "black";
            return;
        }
    }

    function handle_mouse_down(elem) {
        if (setting_blocks_mode)
            setMousePressed(true);

    }

    function handle_mouse_enter(elem) {
        if (!setting_blocks_mode || !mousePressed)
            return;

        grid[elem.row_index][elem.col_index].is_block = true;

        if (elem.id !== start_sq.id && elem.id !== dest_sq.id)
            document.getElementById(elem.id).style.backgroundColor = "black";

    }

    function handle_mouse_up(elem) {
        if (setting_blocks_mode)
            setMousePressed(false);
    }

    function get_neighbours(sq) {
        var temp_arr = [];
        if (sq.row_index - 1 >= 0)
            temp_arr.push(grid[sq.row_index - 1][sq.col_index])
        if (sq.row_index + 1 < n_rows)
            temp_arr.push(grid[sq.row_index + 1][sq.col_index])
        if (sq.col_index - 1 >= 0)
            temp_arr.push(grid[sq.row_index][sq.col_index - 1])
        if (sq.col_index + 1 < n_cols)
            temp_arr.push(grid[sq.row_index][sq.col_index + 1])

        var res_arr = [];
        for (let i = 0; i < temp_arr.length; i++) {
            if (!temp_arr[i].is_block && !temp_arr[i].visited)
                res_arr.push(temp_arr[i]);
        }
        return res_arr;
    }

    function update_queue(queue, new_elem) {
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].id === new_elem.id)
                return queue;
        }
        return [...queue, new_elem];
    }

    function get_updated_grid(squares_to_update) {
        let new_grid = new Array(n_rows); // create an empty array of length n
        for (let i = 0; i < n_rows; i++)
            new_grid[i] = new Array(n_cols); // make each element an array


        for (let i = 0; i < n_rows; i++)
            for (let j = 0; j < n_cols; j++)
                new_grid[i][j] = grid[i][j];

        for (let i = 0; i < squares_to_update.length; i++)
            new_grid[squares_to_update[i].row_index][squares_to_update[i].col_index] = squares_to_update[i];

        return new_grid;
    }

    async function find_shortest_path(cost_func) {
        setSettingBlocksMode(false);
        setCalculationMode(true);
        let current_sq;
        var neighbours;
        var queue_arr = [start_sq];
        while (queue_arr.length > 0) {
            current_sq = queue_arr[0];
            if (current_sq.id === dest_sq.id) {
                console.log("@ reached to dest_sq");
                break;
            }
            queue_arr = queue_arr.slice(1);
            neighbours = get_neighbours(current_sq);
            for (let j = 0; j < neighbours.length; j++) {
                if (neighbours[j].visited) {
                    console.log("sq: " + current_sq.row_index + "," + current_sq.col_index + " already visited!");
                }

                else if (neighbours[j].dist > current_sq.dist + 1) { // +1 because all distances between squares are 1   
                    neighbours[j].dist = current_sq.dist + 1;
                    neighbours[j].prev = current_sq;
                    neighbours[j].cost = cost_func(current_sq);
                }
                queue_arr = update_queue(queue_arr, neighbours[j]);
            }
            // sort the queue_arr if needed
            queue_arr = sort_queue(queue_arr);

            console.log("current_sq: " + current_sq.row_index + "," + current_sq.col_index);
            current_sq.visited = true;
            if (current_sq.id !== start_sq.id && current_sq.id !== dest_sq.id)
                document.getElementById(current_sq.id).style.backgroundColor = "green";

            grid[current_sq.row_index][current_sq.col_index] = current_sq;

            await sleep(1);


        }

        setCalculationMode(false);
        setGrid(grid);
        animate_shortest_path()
    }

    function sort_queue(queue) {
        for (var i = 0; i < queue.length; i++) {
            for (var j = 0; j < (queue.length - i - 1); j++) {
                if (queue[j].cost > queue[j + 1].cost) {
                    var temp = queue[j]
                    queue[j] = queue[j + 1]
                    queue[j + 1] = temp
                }
            }
        }
        return queue;
    }

    async function animate_shortest_path() {
        var current_sq = grid[dest_sq.row_index][dest_sq.col_index];
        while (current_sq.id !== start_sq.id) {
            current_sq.in_shortest_path = true;
            if (current_sq.id !== dest_sq.id)
                document.getElementById(current_sq.id).style.backgroundColor = "orange";

            current_sq = current_sq.prev;
            await sleep(20);
        }

    }

    function run_dijkstra() {
        find_shortest_path(function (sq) {
            return 1;
        })
    }

    function run_A_star() {
        find_shortest_path(function (sq) {
            let x1 = sq.row_index;
            let y1 = sq.col_index;
            let x2 = dest_sq.row_index;
            let y2 = dest_sq.col_index;
            return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        })

    }

    return (
        <div className="grid" style={{ cursor: cursor }}>
            <div className="header">
                <h2>Searches</h2>
                <button onClick={set_start_point}> Set start and dest </button>
                <br />
                <button onClick={run_dijkstra}> Dijkstra </button>
                <button onClick={run_A_star}> A*</button>

            </div>

            {grid.map((row, index) => {
                return <div key={index} className="Squares">
                    {row.map((elem, col_index) => <Square key={elem.id} id={elem.id}
                        start_point={elem.start_point}
                        dest_point={elem.dest_point}
                        is_block={elem.is_block}
                        visited={elem.visited}
                        in_shortest_path={elem.in_shortest_path}
                        onClick={() => handle_sq_click(elem)}
                        onMouseDown={() => handle_mouse_down(elem)}
                        onMouseEnter={() => handle_mouse_enter(elem)}
                        onMouseUp={() => handle_mouse_up(elem)}
                    />)}

                </div>
            })}



        </div>
    );
}


export default Grid;
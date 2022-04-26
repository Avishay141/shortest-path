import React, { useState } from "react";
import "./Square.css";

function Square(props) {

    function setBgcolor() {
        if (props.start_point)
            return "yellow";
        else if (props.dest_point) {
            return "red";
        } else if (props.is_block) {
            return "black";
        } else if (props.in_shortest_path) {
            return "orange";
        } else if (props.visited) {
            return "green";
        } else {
            return "white";
        }


    }

    return (
        <div className="square"
            style={{ backgroundColor: setBgcolor() }}
            id={props.id}
            onClick={props.onClick}
            onMouseDown={props.onMouseDown}
            onMouseEnter={props.onMouseEnter}
            onMouseUp={props.onMouseUp}
        >

        </div>
    );
}


export default Square;
import React, { useState } from "react";
import Grid from "./Grid";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  return (
    <div className="App">

      <Grid rows={50} cols={50} />

    </div>
  );
}

export default App;

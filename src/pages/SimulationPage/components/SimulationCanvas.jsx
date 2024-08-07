import React, { useRef, useEffect } from 'react';

import ZshapePipe from './ZShapePipe/Pipe';
import MirrorLPipe from './MirrorLPipe/Pipe';
import StraightPipe from './StraightPipe/Pipe';
import LShapePipe from './LShapePipe/Pipe';
import EShapePipe from './EShapePipe/Pipe';


import roPlantImage from "../../images/ro_plant.png";
import roCoolerImage from "../../images/ro_cooler.png";
import Motor from "../../images/Motor.png";
import SumpIcon from "../../images/Sump.png";
import PumpHouse from "../../images/pump_house.png";
import Borewell from "../../images/borewell.png";
import Watertank from "../../images/watertank.png";
import ROWatertank from "../../images/tank_ro.png";
import Washrooms from "../../images/Washrooms.png";
import Sump from './Sump/Sump';
import WaterTank from './WaterTank/Watertank';
import Lshapepipeoht from './LShapePipe/PipeOHT'
import ROLpipe from './LShapePipe/ROLpipe';
import ELpipe from './LShapePipe/ELpipe';

const SimulationCanvas = ({
  handleIconClick,
  iconRefs,
  flow1,
  setFlow1,
  flow2,
  flow3,
  flow4,
  flow5,
  flow6,
  flow7,
  flow8,
  flow9,
  waterInSump,
  sumpCapacity,
  motorOn,
  toggleIsOn,
  isSimulationRunning,
  handleMotorToggle,
  waterInOHT,
  ohtCapacity,
  waterInROFilter,
  waterConsumed,
  flowrate
}) => {
  const pumpHouseRef = useRef(null);
  const borewellRef = useRef(null);
  const motorRef = useRef(null);
  const adminBlockWashroomsRef = useRef(null);
  const krbWashroomsRef = useRef(null);
  const roPlantRef = useRef(null);
  const krbROOHTRef = useRef(null);
  const roCooler1Ref = useRef(null);
  const roCooler2Ref = useRef(null);
  const roCooler3Ref = useRef(null);

  const pipeRefs = useRef([]);
  const addPipeRef = (el) => {
    if (el && !pipeRefs.current.includes(el)) {
      pipeRefs.current.push(el);
    }
  };

  useEffect(() => {
    iconRefs.current = [
      pumpHouseRef.current,
      borewellRef.current,
      motorRef.current,
      adminBlockWashroomsRef.current,
      krbWashroomsRef.current,
      roPlantRef.current,
      krbROOHTRef.current,
      roCooler1Ref.current,
      roCooler2Ref.current,
      roCooler3Ref.current,
      ...pipeRefs.current
    ].filter(Boolean);
  }, [iconRefs]);
  return (
    <div>
      {/* PumpHouse */}
      <div style={{ position: "absolute", top: "1vw", left: "1.5vw"}} id="pumpHouseIcon">
        <img src={PumpHouse} alt="sump" style={{ width: "4.8vw", height: "4.8vw" }} onClick={(e) => handleIconClick(e)}
          ref={(ref) => { if (ref) { ref.id = "PumpHouse1"; iconRefs.push(ref); } }}
        />
        <div style={{ fontSize: "1vw" }}>PumpHouse</div>
      </div>

      {/* Z Shape Pipe Pumphouse to Sump */}
      <div style={{ position: "absolute", top: "2.5vw", left: "5.5vw" }}>
        <ZshapePipe flow={flow1}
        ref={(ref) => { if (ref) { ref.id = "PipeP1toSump"; iconRefs.push(ref); } }} />
      </div>

      {/* Straight Pipe from Borewell to Sump */}
      <div style={{ position: "absolute", top: "16vw", left: "13vw" }}>
        <StraightPipe flow={flow2} style={{ width: "4.8vw", height: "4.8vw" }} 
        ref={(ref) => { if (ref) { ref.id = "PipeBoreToSump"; iconRefs.push(ref); } }}
        />
      </div>

      {/* Borewell */}
      <div id="borewellIcon" style={{ position: "absolute", top: "10vw", left: "1.5vw" }}>
        <img
          src={Borewell}
          alt="borewell"
          style={{ width: "4.8vw", height: "4.8vw" }}
          onClick={(e) => handleIconClick(e)}
          ref={(ref) => { if (ref) { ref.id = "Borewell1"; iconRefs.push(ref); } }}
        />
        <div style={{ fontSize: "1vw" }}>Borewell</div>
      </div>

      {/* Straight Pipes Sump to Motor */}
      <div>
        <div style={{ position: "absolute", top: "16.2vw", left: "24vw" }}>
          <StraightPipe flow={flow3} 
          ref={(ref) => { if (ref) { ref.id = "PipeSumpToMotor"; iconRefs.push(ref); } }} />
        </div>

        {/* Sump */}
        <Sump waterInSump={waterInSump} sumpCapacity={sumpCapacity} handleIconClick={(e) => handleIconClick(e)}
          ref={(ref) => { if (ref) { ref.id = "KRBSump"; iconRefs.push(ref); } }} />
         
         {/* MirrorLPipe Motor to OHT P1 */}
        <div style={{ position: "absolute", top: "7.5vw", left: "23vw" }}>
          <MirrorLPipe flow={flow4} 
          ref={(ref) => { if (ref) { ref.id = "PipeMotorToOHT"; iconRefs.push(ref); } }} />
        </div>

        {/* Motor */}
        <div style={{ position: "absolute", zIndex: 2, top: "12.5vw", left: "20.3vw", textAlign: "center", width: "5.8vw" }}
          ref={(ref) => { if (ref) { ref.id = "Motor"; iconRefs.push(ref); } }}>
          <img src={Motor} alt="Motor"
            className={`motor ${motorOn ? "running" : ""}`}
            style={{ width: "3vw", height: "3vw", transform: "scaleX(-1)", }}
            onClick={() => {
              toggleIsOn("valve5");
              if (isSimulationRunning) {
                handleMotorToggle();
              }
            }}
          />
          {motorOn && (<div style={{ fontSize: "10px", color: "green" }}>Running</div>)}
          <div style={{ fontSize: "0.6vw" }}>Motor Pumping Rate</div>
          <div style={{ fontSize: "0.8vw" }}><b>{motorOn ? (flowrate + Math.random() * 2 - 1).toFixed(2) : 0} L/s</b></div>
        </div>

        {/* L Shape Pipe from motor to oht */}
        <div style={{ position: "absolute", top: "8vw", left: "34.5vw",  zIndex: "1" }}>
          <Lshapepipeoht flow={flow4} 
          ref={(ref) => { if (ref) { ref.id = "PipeMotorToOHT"; iconRefs.push(ref); } }} />
        </div>

        {/* L Shape Pipe OHT to RO PIPE */}
        <div style={{ position: "absolute", top: "2.5vw", left: "34.7vw", transform: "rotate(270deg)" }}>
          <ELpipe flow={flow5} 
          ref={(ref) => { if (ref) { ref.id = "PipeOHTtoRO"; iconRefs.push(ref); } }} />
        </div>

        {/* Straight Pipe1 for extension  */}
      <div style={{ position: "absolute", top: "9.7vw", left: "47.9vw" }}>
        <StraightPipe flow={flow5} style={{ width: "4.8vw", height: "4.8vw" }}/>
      </div>

      {/* Straight Pipe2 for extension  */}
      <div style={{ position: "absolute", top: "9.7vw", left: "53.9vw" }}>
        <StraightPipe flow={flow5} style={{ width: "4.8vw", height: "4.8vw" }} 
        />
      </div>
          
        <div style={{ position: "absolute", top: "11vw", left: "36.7vw", textAlign: "center" }}>
          <img src={Washrooms} alt="WaterTank" style={{ width: "3.8vw", height: "3.8vw" }}
            ref={(ref) => { if (ref) { ref.id = "AdminBlockWashrooms"; iconRefs.push(ref); } }} />
            <div style={{ fontSize: "0.7vw" }}>Admin Block<br></br> Washrooms</div>
        </div>

        <div style={{ position: "absolute", top: "11vw", left: "41.6vw", textAlign: "center" }}>
          <img src={Washrooms} alt="WaterTank" style={{ width: "3.8vw", height: "3.8vw" }}
            ref={(ref) => { if (ref) { ref.id = "KRBWashrooms"; iconRefs.push(ref); } }} />
            <div style={{ fontSize: "0.7vw" }}>KRB Washrooms</div>
        </div>

        {/* L Shape Pipe OHT to RO plant */}
        <div style={{ position: "absolute", top: "9vw", left: "58vw", }}>
          <LShapePipe flow={flow5} 
          ref={(ref) => { if (ref) { ref.id = "PipeOHTtoRO"; iconRefs.push(ref); } }} />
        </div>

        {/* Straight Pipe OHT to Admin block Washrooms */}
        <div style={{ position: "absolute", top: "16vw", left: "38.7vw", transform: "rotate(90deg)" }}>
          <StraightPipe flow={flow6} 
          ref={(ref) => { if (ref) { ref.id = "PipeOHTtoAdminWashrooms"; iconRefs.push(ref); } }} />
        </div>

        {/* Water Tower */}
        <div>
        <WaterTank waterInOHT={waterInOHT} ohtCapacity={ohtCapacity} handleIconClick={(e) => handleIconClick(e)}
          ref={(ref) => { if (ref) { ref.id = "KRBOHTIcon"; iconRefs.push(ref); } }} />
        </div>

        {/* Straight Pipe to KRB Washrooms */}
        <div style={{ position: "absolute", top: "16vw", left: "44.5vw", transform: "rotate(90deg)" }}>
          <StraightPipe flow={flow7} 
          ref={(ref) => { if (ref) { ref.id = "PipeOHTtoKRBWashrooms"; iconRefs.push(ref); } }} />
        </div>

        {/* L Shape Pipe RO to RO OHT */}
        <div style={{ position: "absolute", top: "3vw", left: "49.9vw",  }}>
          <ROLpipe flow={flow5} 
          ref={(ref) => { if (ref) { ref.id = "PipeROtoROOHT"; iconRefs.push(ref); } }} />
        </div>

        {/* RO Plant */}
        <div style={{ position: "absolute", top: "0vw", left: "52vw" }}>
        <div style={{ fontSize: "0.6vw" }}><b>RO Plant</b></div>
          <img src={roPlantImage} alt="ro plant" style={{ width: "4.8vw", height: "4.8vw" }}
            onClick={(e) => handleIconClick(e)} ref={(ref) => { if (ref) { ref.id = "ROPlant"; iconRefs.push(ref); } }} /> 
        </div>

        {/* Lpipe from ROOHT to RO1 */}

        <div style={{ position: "absolute", top: "10.1vw", left: "52.8vw" }}>
          <ELpipe flow={flow8} 
          ref={(ref) => { if (ref) { ref.id = "PipetoRO1"; iconRefs.push(ref); } }} />
        </div>

       {/* Straight from ROOHT to RO2 */}

        <div style={{ position: "absolute", top: "16vw", left: "54vw", transform: "rotate(90deg)" }}>
          <StraightPipe
          ref={(ref) => { if (ref) { ref.id = "PipetoRO2"; iconRefs.push(ref); } }} />
        </div>

        {/* Lpipe from ROOHT to RO3 */}

        <div style={{ position: "absolute", top: "10.1vw", left: "51vw" }}>
          <ROLpipe flow={flow9} 
          ref={(ref) => { if (ref) { ref.id = "PipetoRO2"; iconRefs.push(ref); } }} />
        </div>

        {/* E Shape Pipe RO OHT to Ro Filters
        <div style={{ position: "absolute", top: "15vw", left: "59vw" }}>
          <EShapePipe flow={flow9} 
          ref={(ref) => { if (ref) { ref.id = "PipeROOHTtoFilters"; iconRefs.push(ref); } }} />
        </div> */}

        {/* Water Tower */}
        <div style={{ position: "absolute", top: "6vw", left: "53.6vw" , textAlign: "center" }}>
          {/* <div style={{ fontSize: "1vw" }}><b>{waterInROFilter.toFixed(2)}L</b></div> */}
          <div style={{ fontSize: "0.6vw" }}>RO OHT <br></br> <b>{waterInROFilter.toFixed(2)}L</b></div>
          <img src={ROWatertank} alt="WaterTank" style={{ width: "5vw", height: "5vw" }} onClick={(e) => handleIconClick(e)}
            ref={(ref) => { if (ref) { ref.id = "KRBROOHT"; iconRefs.push(ref); } }} />
        </div>

        {/* RO Coolers */}
        <div style={{ position: "absolute", top: "14vw", left: "51.5vw", textAlign: "center" }}>
          <img src={roCoolerImage} alt="ro cooler 1" style={{ width: "3.2vw", height: "3.8vw" }}
            onClick={(e) => handleIconClick(e)}
            ref={(ref) => { if (ref) { ref.id = "ROCooler1"; iconRefs.push(ref); } }} />
          <div style={{ fontSize: "0.7vw" }}>RO 1</div>
          {/* <div style={{ fontSize: "0.7vw" }}><b>{((3 * waterConsumed) / 4).toFixed(1)}L</b></div> */}
        </div>

        <div style={{ position: "absolute", top: "14vw", left: "54.3vw", textAlign: "center" }}>
          <img src={roCoolerImage} alt="ro cooler 2" style={{ width: "3.2vw", height: "3.8vw" }}
            onClick={(e) => handleIconClick(e)}
            ref={(ref) => { if (ref) { ref.id = "ROCooler2"; iconRefs.push(ref); } }} />
          <div style={{ fontSize: "0.7vw" }}>RO 2</div>
        </div>

        <div style={{ position: "absolute", top: "14vw", left: "57vw", textAlign: "center" }}>
          <img src={roCoolerImage} alt="ro cooler 3" style={{ width: "3.2vw", height: "3.8vw" }}
            onClick={(e) => handleIconClick(e)}
            ref={(ref) => { if (ref) { ref.id = "ROCooler3"; iconRefs.push(ref); } }} />
          <div style={{ fontSize: "0.7vw" }}>RO 3</div>
          {/* <div style={{ fontSize: "0.7vw" }}><b>{(waterConsumed / 4).toFixed(1)}L</b></div> */}
        </div>
      </div>
    </div>
  )
};

export default SimulationCanvas;

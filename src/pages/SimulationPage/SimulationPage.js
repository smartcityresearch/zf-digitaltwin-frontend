import React, { useState, useEffect } from "react";
import "./SimulationPage.css";

import NavigationBar from "../../components/navigation/Navigation";
import Toolbar from "./components/ToolBar";
import SimulationForm from "./components/SimulationForm";
import ResultContainer from "./components/ResultContainer";
import LeakageOptions from "./components/LeakageOptions";
import SimulationCanvas from "./components/SimulationCanvas";

import whiteimage from "../images/white.png";
import MotorNode from "../images/MotorNode.png"; 
import WaterLevelNode from "../images/WaterLevelNode.png";
import WaterQualityNode from "../images/WaterQualityNode.png";
import WaterQuantityNode from "../images/WaterQuantityNode.png";
import LeakageIcon from "../images/leakage_water.png"; 


const backendAPI = "http://smartcitylivinglab.iiit.ac.in:1629";
// const backendAPI = "http://localhost:1629";

const SimulationPage = () => {
  // State for holding input values and results
  const iconRefs = [];
  const [isMarkerPlaced, setIsMarkerPlaced] = useState(false);
  const [inputValues, setInputValues] = useState({
    voltage: "",
    temperature: "25",
    desired_tds: "50",
    effective_membrane_area: "370",
    sumpCapacity: "6000",
    ohtCapacity: "600",
    roCapacity: "50",
    flowrate: "5"
  });
  const [result, setResult] = useState(null);
  const [soilContamination, setSoilContamination] = useState(null);
  const [sandContamination, setSandContamination] = useState(null);
  const [isOn, setIsOn] = useState({
    valve1: true,
    valve2: true,
    valve3: true,
    valve4: true,
    valve5: true,
  });

  const [flow1, setFlow1] = useState(false);
  const [flow2, setFlow2] = useState(false);
  const [flow3, setFlow3] = useState(false);
  const [flow4, setFlow4] = useState(false);

  const [sensorValues, setSensorValues] = useState({
    KRBSump: 0,
    KRBOHTIcon: 0,
    KRBROOHT: 0,
  });

  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [waterInSump, setWaterInSump] = useState(6000); // Initial water level in Sump
  const [waterInOHT, setWaterInOHT] = useState(0); // Initial water level in OHT
  const [motorOn, setMotorOn] = useState(false); // Initial motor state
  const [waterInROFilter, setWaterInROFilter] = useState(2); // Initial water level in RO Filter
  const [alertShown, setAlertShown] = useState(false);
  const [waterFlowStarted, setWaterFlowStarted] = useState(false);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [showMotorStatus, setShowMotorStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);


  const [infoText, setInfoText] = useState("");
  const [SoilQuantity, setSoilQuantity] = useState("");
  const [SandQuantity, setSandQuantity] = useState("");
  const [voltageValue, setVoltageValue] = useState("");
  const voltageData = {
    0: 1.2,
    1: 2.3,
    2: 3.4,
    3: 4.5,
    4: 5.6,
    5: 6.7,
  };

  const [showLeakageOptions, setShowLeakageOptions] = useState(false);
  const [numLeakages, setNumLeakages] = useState(1);
  const [leakageLocation, setLeakageLocation] = useState("");
  const [leakageRate, setLeakageRate] = useState(0); // Add state for leakage rate
  const [leakageMarkers, setLeakageMarkers] = useState([]);
  // Function to handle leakage icon click
  const handleLeakageIconClick = () => {
    setShowLeakageOptions(true);
  };
  // Function to handle applying leakage options
  const handleApplyLeakages = () => {
    const newMarkers = [];
    for (let i = 0; i < numLeakages; i++) {
      // Calculate position based on leakageLocation and index (to distribute markers)
      const position = calculateLeakagePosition(leakageLocation, i, numLeakages);
      newMarkers.push({
        type: "leakage",
        x: position.x,
        y: position.y,
        rate: leakageRate, // Include leakage rate in the marker data
      });
    }
    setLeakageMarkers(newMarkers);
    setShowLeakageOptions(false);
  };
  // Function to calculate leakage position (you'll need to implement the logic)
  const calculateLeakagePosition = (location, index, totalLeakages) => {
    let x, y;
    if (location === "motorOHT") {
      // Hardcoded coordinates for the three possible leakage positions
      const leakagePositions = [
        { x: 890, y: 510 }, // Motor end
        { x: 920, y: 460 }, // Middle pipe
        { x: 950, y: 410 }, // Near OHT
      ];
  
      // Ensure totalLeakages is within the allowed range (1 to 3)
      totalLeakages = Math.max(1, Math.min(3, totalLeakages));
  
      // Determine the index for the leakage position based on totalLeakages
      let positionIndex;
      if (totalLeakages === 1) {
        positionIndex = 0; // Only use the motor end position
      } else if (totalLeakages === 2) {
        positionIndex = index * 2; // Use motor end and middle positions
      } else {
        positionIndex = index; // Use all three positions
      }
  
      // Get the coordinates from the leakagePositions array
      ({ x, y } = leakagePositions[positionIndex]);
    } // ... (rest of your logic)
    return { x, y };
  };
  

  useEffect(() => {
    let intervalId;
    let intervalwaterConsume;
    if (waterFlowStarted) {
      intervalId = setInterval(() => {
        if (motorOn) {
          // Pump water from Sump to OHT if motor is on
          if (waterInSump > 0 && waterInOHT < inputValues.ohtCapacity) {
            setWaterInSump((prev) => Math.max(prev - inputValues.flowrate, 0));

        // Calculate total leakage rate (limited to 4 L/s)
            const totalLeakageRate = Math.min(
              leakageMarkers.reduce((sum, marker) => {
                if (marker.type === "leakage" && marker.location === "motorOHT") {
                  return sum + marker.rate;
                }
                return sum;
              }, 0),
              4 // Maximum leakage rate
            );

            console.log("Total Leakage Rate:", totalLeakageRate); // Check the calculated value

        // Calculate the effective flow rate into OHT
        const effectiveFlowRate = Math.max(5 - totalLeakageRate, 1); 
        console.log("Effective Flow Rate:", effectiveFlowRate); // Check the flow rate

        const prevWaterInOHT = waterInOHT; // Get previous water level
        setWaterInOHT((prev) => Math.min(prev + effectiveFlowRate, inputValues.ohtCapacity)); 
        console.log("Water in OHT:", waterInOHT, "(Previous:", prevWaterInOHT, ")"); // Verify state update 
        }
        
          if ((waterInOHT === inputValues.ohtCapacity || waterInSump === 0) && !alertShown) {
            alert("Motor turned off automatically since water tank is full.");
            setMotorOn(false);
            setFlow2(false);
            setAlertShown(true); // Set alertShown to true to prevent repeated alerts
          }
        }

        // Pump water from OHT to RO Filter continuously
        if (waterInOHT > 0 && waterInROFilter < inputValues.roCapacity) {
          setWaterInOHT((prev) => Math.max(prev - inputValues.flowrate, 0));
          setWaterInROFilter(
            (prev) => prev + (result ? result.permeate_flow_rate / 360 : 0)
          ); // Increase water in RO Filter by permeate flow rate, converted from l/m2/hr to l/s
        }
        // If water in OHT is less than 20%, turn on the motor automatically
        if (waterInOHT < (20*inputValues.ohtCapacity)/100) {
          setMotorOn(true);
          setFlow2(true);
        }
        if (waterInSump === 0) {
          setMotorOn(false);
          setFlow2(false);
          // alert("No water in sump.");
        }
      }, 1000); // Run every second

      intervalwaterConsume = setInterval(() => {
        if (waterInROFilter > 1) {
          handleConsumeWater();
        }
      }, 1000);
    }

    const logIconCoordinates = () => {
      iconRefs.forEach((ref, index) => {
        const iconId = ref.id;
        const rect = ref.getBoundingClientRect();
        const iconCoordinates = {
          x: rect.left,
          y: rect.top,
        };
        // These coordinates are used to know the postions of the SUMP, OHT etc 
        console.log(`Icon ${iconId} coordinates:`, iconCoordinates);
        // You can now use iconCoordinates as needed
      });
    };
    logIconCoordinates();
    return () => {
      clearInterval(intervalId);
      clearInterval(intervalwaterConsume);
    }; // Cleanup interval on unmount or when simulation stops
  }, [
    waterFlowStarted,
    motorOn,
    waterInSump,
    waterInOHT,
    waterInROFilter,
    alertShown,
    leakageRate
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if simulation is running
    if (isSimulationRunning) {
      // If simulation is running, stop it
      handleStopWaterFlow();
      setIsSimulationRunning(false);

      // Update input values
      setInputValues((prevInputValues) => ({
        ...prevInputValues,
        [name]: value,
      }));

      // Restart the simulation
      handleCalculate(); // Recalculate
      handleStartWaterFlow(); // Restart the simulation
      setIsSimulationRunning(true);
    } else {
      // If simulation is not running, simply update input values
      setInputValues((prevInputValues) => ({
        ...prevInputValues,
        [name]: value,
      }));
    }
    if (name === "sumpCapacity") {
      setWaterInSump(parseInt(value) || 0); // Parse value as integer and set waterInSump
    }
  };

  const ResultCard = ({ title, value }) => {
    return (
      <div className="result-card">
        <h5>{title}</h5>
        <p>{value}</p>
      </div>
    );
  };

  // Function to call the api calculate_soil_contamination from backend and get the result
  const calculateSoilContamination = async () => {
    try {
      const response = await fetch(`${backendAPI}/calculate_soil_contamination`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(inputValues)
      });
      if (!response.ok) {
        throw new Error("Failed to calculate soil contamination");
      }
      const soilContamination = await response.json();
      setSoilContamination(soilContamination);
      return soilContamination; // Return the soil contamination value
    } catch (error) {
      console.error(error);
    }
  };

  const calculateSandContamination = async () => {
    try {
      const response = await fetch(`${backendAPI}/calculate_sand_contamination`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(inputValues)
      });
      if (!response.ok) {
        throw new Error("Failed to calculate sand contamination");
      }
      const sandContamination = await response.json();
      setSandContamination(sandContamination);
      return sandContamination; // Return the sand contamination value
    } catch (error) {
      console.error(error);
    }
  };

  const handleCalculate = async () => {
    try {
      // const selectedNumberValue = parseInt(SoilQuantity);
      // if (isNaN(selectedNumberValue) || selectedNumberValue < 1 || selectedNumberValue > 500) {
      //   alert("Please select a number between 1 and 500.");
      //   return;
      // }
    

      // // Retrieve voltage value from the voltageData object
      // const voltageValue = await fetchVoltageValue(selectedNumberValue);
      // console.log("Voltage Value:", voltageValue);
      // // Calculate initial TDS based on input values
      // const initialTDS = calculateInitialTDS(inputValues);
      

      const soilQuantity = parseInt(SoilQuantity);
      const sandQuantity = parseInt(SandQuantity);
      let calculatedTDS;

      if (soilQuantity !== 0 && sandQuantity === 0) {
        const soilContaminationValue = await calculateSoilContamination(inputValues);
        console.log("Soil Value:", soilContaminationValue)
        calculatedTDS = soilContaminationValue;
      } 
      
      else if (soilQuantity === 0 && sandQuantity !== 0) {
        const sandContaminationValue = await calculateSandContamination(inputValues);
        console.log("Sand Value:", sandContaminationValue)
        calculatedTDS = sandContaminationValue;
        
      } 
      
      else {
        const SandTDS = await calculateSandContamination(inputValues);
        const SoilTDS = await calculateSoilContamination(inputValues);
        console.log("Soil Value:", SoilTDS, "Sand Value:", SandTDS)
        calculatedTDS = (SoilTDS + SandTDS) / 2;
      }

      // Prepare request body including initial TDS
      const requestBody = {
        initial_tds: calculatedTDS,
        desired_tds: inputValues.desired_tds,
        voltage: voltageData[voltageValue],
        temperature: inputValues.temperature,
        effective_membrane_area: inputValues.effective_membrane_area,
        sump_capacity: inputValues.sumpCapacity,
        // Other parameters as needed
      };

      const response = await fetch(
        `${backendAPI}/calculate_ro_filtration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      const data = await response.json();
      setResult(data); // Set the entire response object as result
      setWaterFlowStarted(true);
    } catch (error) {
      console.error("Error calculating RO filtration:", error);
    }
  };

  const getRealData = async (tableName) => {
    try {
      const response = await fetch(`${backendAPI}/get_value?table_name=${tableName}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json(); // Assuming this returns an object
      // Transform the data object into an array of objects for each key-value pair,
      // ensuring null values are handled gracefully.
      const dataArray = Object.entries(data).map(([key, value]) => ({
        title: key,
        value: value === null ? 'N/A' : value.toString(), // Use 'N/A' for null values
      }));
      setData(dataArray); // Assuming you have a setData function to update state
    } catch (error) {
      console.error("Fetch error:", error);
      setData([{ title: "Error", value: "Failed to fetch data" }]); // Update accordingly
    }
  };

  const toggleIsOn = (valve) => {
    setIsOn((prevState) => ({ ...prevState, [valve]: !prevState[valve] }));
  };

  const handleStartWaterFlow = () => {
    setWaterFlowStarted(true);
  };

  const handleStopWaterFlow = () => {
    setWaterFlowStarted(false);
  };

  const handleMotorToggle = () => {
    if (!motorOn) {
      setAlertShown(false); // Reset alertShown state when motor is manually turned off
    }
    setMotorOn((prev) => !prev); // Toggle motor state
    setFlow2((flow2) => !flow2);
  };

  const handleStartSimulation = () => {
    if (!isSimulationRunning) {
      handleCalculate(); // Start calculation
      // calculateSoilContamination();
      handleStartWaterFlow(); // Start water flow
      setIsSimulationRunning(true);
      // setFlow4((flow4) => !flow4);
      setFlow1((flow1) => !flow1);
    } else {
      handleStopWaterFlow(); // Stop water flow
      setIsSimulationRunning(false);
      setFlow1(false);
      setFlow2(false);
      setFlow3(false);
      setFlow4(false);
      setMotorOn(false);
    }
  };

  const handleConsumeWater = () => {
    if (waterInROFilter >= 0.5) {
      setWaterInROFilter((prev) => prev - 0.5); 
      setWaterConsumed((prev) => prev + 0.5); 
    } else {
      alert("Not enough water in RO Filter to consume.");
    }
  };

  const [canvasItems, setCanvasItems] = useState([]);

  // This state is used to track the type of item that we need to add to the canvas
  const [itemToAdd, setItemToAdd] = useState(null);
  
  const handleDragStart = (event, index) => {
    // Set the dataTransfer object with the item's index if we are moving an existing item
    if (index !== undefined) {
      event.dataTransfer.setData('index', index);
    }
    
    // Capture the coordinates of the draggable marker
    const markerCoordinates = {
      x: event.clientX,
      y: event.clientY,
    };
    
    // Log the marker coordinates
    // console.log("Marker coordinates during drag start:", markerCoordinates);
    
    // Call function to check if marker overlaps with any icon
    const { isPlaced, iconId } = checkMarkerOverlap(markerCoordinates);
    console.log("Marker is placed on:", iconId);
    setIsMarkerPlaced(isPlaced);
  };
  
  
  const checkMarkerOverlap = (markerCoordinates) => {
    let isPlaced = false;
    let iconId = null;
  
    // Iterate over each icon and check if the marker overlaps with it
    iconRefs.forEach((ref, index) => {
      const rect = ref.getBoundingClientRect();
      if (
        markerCoordinates.x >= rect.left &&
        markerCoordinates.x <= rect.left + rect.width &&
        markerCoordinates.y >= rect.top &&
        markerCoordinates.y <= rect.top + rect.height
      ) {
        iconId = ref.id; // Update iconId if the marker overlaps with the icon
        // console.log(`Marker is placed on ${iconId}`);
        if (iconId === 'KRBSump') {
          console.log("Marker is Placed on KRB Sump");
        }
        isPlaced = true;
      }
    });
  
    if (!isPlaced) {
      console.log("checkMarkerOverlap - Marker is not placed on any icon: ");
    }
     else {
      console.log(`checkMarkerOverlap - Marker is placed on: ${iconId}`);
    }
  
    return { isPlaced, iconId };
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const canvasRect = event.currentTarget.getBoundingClientRect();
    const index = event.dataTransfer.getData('index');
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    

    if (index) {
      // We're dragging an existing item, update its position
      const updatedItems = [...canvasItems];
      updatedItems[index] = {
        ...updatedItems[index],
        x: x,
        y: y
      };
      setCanvasItems(updatedItems);
      console.log(`Moved item ${updatedItems[index].type} to x: ${x}, y: ${y}`);
    } else if (itemToAdd) {
      // We're adding a new item, add it to the canvasItems state with the dropped position
      const newItem = {
        type: itemToAdd,
        x: x,
        y: y
      };
      setCanvasItems([...canvasItems, newItem]);
      setItemToAdd(null); // Reset the itemToAdd since it has been added
      console.log(`Added item of type ${itemToAdd} at x: ${x}, y: ${y}`);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  const handleToolbarItemClick = (type) => {
    // Prepare to add a new item when the next drop occurs
    // Instead of directly adding the item, we set an "item to add" state
    setItemToAdd(type);
  };

  const handleIconClick = (event) => {
    const refId = event.target.id;
    const iconCoordinates = {
      x: event.clientX,
      y: event.clientY,
    };
    console.log(refId, "coordinates:", iconCoordinates);
  };

  const handleMarkerClick = (item, index, event) => {
    const { clientX, clientY } = event; 
    const coordinates = {
      x: clientX,
      y: clientY,
    };
    
    const { isPlaced, iconId } = checkMarkerOverlap(coordinates);
    console.log("Marker of type ", item.type , "placed on",iconId, "at coordinates:", coordinates);

    if(iconId=='KRBSump' && item.type=='waterlevelsensor'){
      setSensorValues(prevValues => ({
        ...prevValues,
        KRBSump: (waterInSump/inputValues.sumpCapacity)*100,
      }));
    }
    if(iconId=='KRBOHTIcon' && item.type=='waterlevelsensor'){
      setSensorValues(prevValues => ({
        ...prevValues,
        KRBOHTIcon: (waterInOHT/inputValues.ohtCapacity)*100,
      }));
    }
    if(iconId=='KRBROOHT' && item.type=='waterlevelsensor'){
      setSensorValues(prevValues => ({
        ...prevValues,
        'KRBROOHT': (waterInROFilter/inputValues.roCapacity)*100,
      }));
    }
  };
  
  const getImageForType = (type) => {
    switch (type) {
      case 'waterqualitysensor':
        return WaterQualityNode;
      case 'waterquantitysensor':
        return WaterQuantityNode;
      case 'waterlevelsensor':
        return WaterLevelNode;
      case 'motorsensor':
        return MotorNode;
      default:
        return ''; // default image or empty string if none
    }
  };


  return (
    <div>
      <NavigationBar title="Digital Twin for Water Quality - Simulation" />
      <div style={{ display: "flex" }}>
        {/* Left Section */}
        <SimulationForm 
            SoilQuantity={SoilQuantity} 
            setSoilQuantity={setSoilQuantity} 
            SandQuantity={SandQuantity} 
            setSandQuantity={setSandQuantity} 
            inputValues={inputValues} 
            handleChange={handleChange} 
            handleStartSimulation={handleStartSimulation} 
            isSimulationRunning={isSimulationRunning} 
        />
        {/* Middle Section */}
        <div style={{ flex: 3 }}>
          {/* Toolbar */}
          <Toolbar 
              handleToolbarItemClick={handleToolbarItemClick} 
              handleLeakageIconClick={handleLeakageIconClick} 
          />
        
          <LeakageOptions
          showLeakageOptions={showLeakageOptions}
          numLeakages={numLeakages}
          setNumLeakages={setNumLeakages}
          leakageLocation={leakageLocation}
          setLeakageLocation={setLeakageLocation}
          leakageRate={leakageRate}
          setLeakageRate={setLeakageRate}
          handleApplyLeakages={handleApplyLeakages}
          />

          <div className="demo-page">
            <div
              style={{
                position: 'relative',
                width: '60vw',
                height: '40vw',
                border: '1px solid black',
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img src={whiteimage} alt="blueprint" style={{ width: "100%", height: "100%" }}/>
              <SimulationCanvas 
                  handleIconClick={handleIconClick}
                  iconRefs={iconRefs}
                  flow1={flow1}
                  flow2={flow2}
                  setFlow1={setFlow1}
                  waterInSump={waterInSump}
                  motorOn={motorOn}
                  toggleIsOn={toggleIsOn}
                  isSimulationRunning={isSimulationRunning}
                  handleMotorToggle={handleMotorToggle}
                  waterInOHT={waterInOHT}
                  waterInROFilter={waterInROFilter}
                  waterConsumed={waterConsumed}
                />

              {/* IoT Nodes  */}
              <div style={{ position: "absolute", top: "21vw", left: "13vw", textAlign: "center", }}>
                <img src={WaterQualityNode} alt="WaterQuality Node"
                  style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('WM-WD-KH98-00')}
                />
              </div>

              <div style={{ position: "absolute", top: "21vw", left: "29vw", textAlign: "center", }}>
                <img src={WaterQualityNode} alt="WaterQuality Node"
                 style={{ width: "3vw", height: "3vw",}}
                onClick={() => getRealData('WM-WD-KH96-00')}
                />
              </div>

              <div style={{ position: "absolute", top: "24vw", left: "38vw", textAlign: "center", }}>
                <img src={WaterQualityNode} alt="WaterQuality Node"
                  style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('WM-WD-KH96-01')}
                />
                {/* <div>KRB between oht and ro tank</div> */}
              </div>

              <div style={{ position: "absolute", top: "20vw", left: "51vw", textAlign: "center", }}>
                <img src={WaterQualityNode} alt="WaterQuality Node"
                  style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('WM-WD-KH04-00')}
                />
                {/* <div>RO OHT</div> */}
              </div>

              <div style={{ position: "absolute", top: "35vw", left: "44vw", textAlign: "center", }}>
                <img src={WaterQualityNode} alt="WaterQuality Node"
                 style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('WM-WD-KH95-00')}
                />
                {/* <div>RO 1</div> */}
              </div>

              <div style={{ position: "absolute", top: "35vw", left: "50vw", textAlign: "center", }}>
                <img src={WaterQualityNode} alt="WaterQuality Node"
                 style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('WM-WD-KH01-00')}
                />
                {/* <div>RO 3</div> */}
              </div>

              <div style={{ position: "absolute", top: "21vw", left: "17vw", textAlign: "center", }}>
                <img src={WaterLevelNode} alt="WaterLevelNode"
                  style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('WM-WL-KH98-00')}
                />
                {/* <div>SUMP</div> */}
              </div>

              <div style={{ position: "absolute", top: "21vw", left: "33vw", textAlign: "center", }}>
                <img src={WaterLevelNode} alt="WaterLevelNode"
                  style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('WM-WL-KH00-00')}
                />
                {/* <div>OHT</div> */}
              </div>

              <div style={{ position: "absolute", top: "22vw", left: "22.7vw", textAlign: "center", }}>
                <img src={MotorNode} alt="MotorNode"
                  style={{ width: "3vw", height: "3vw",}}
                  onClick={() => getRealData('DM-KH98-60')}
                />
                {/* <div>Motor</div> */}
              </div>

              <div style={{ position: "absolute", top: "4vw", left: "34.5vw", textAlign: "center", }}>
                <img src={WaterQuantityNode} alt="WaterQuantityNode"
                  style={{ width: "2vw", height: "2vw",}}
                  onClick={() => getRealData('WM-WF-KB04-70')}
                />
                {/* <div>W1</div> */}
              </div>

              <div style={{ position: "absolute", top: "10vw", left: "37vw", textAlign: "center", }}>
                <img src={WaterQuantityNode} alt="WaterQuantityNode"
                  style={{ width: "2vw", height: "2vw",}}
                  onClick={() => getRealData('WM-WF-KB04-73')}
                />
                {/* <div>W2</div> */}
              </div>

              <div style={{ position: "absolute", top: "25vw", left: "44.5vw", textAlign: "center", transform: "rotate(90deg)",}}>
                <img src={WaterQuantityNode} alt="WaterQuantityNode"
                  style={{ width: "2vw", height: "2vw",}}
                  onClick={() => getRealData('WM-WF-KB04-71')}
                />
                {/* <div>RO1</div> */}
              </div>

              <div style={{ position: "absolute", top: "25vw", left: "50vw", textAlign: "center", transform: "rotate(90deg)",}}>
                <img src={WaterQuantityNode} alt="WaterQuantityNode"
                  style={{ width: "2vw", height: "2vw",}}
                  onClick={() => getRealData('WM-WF-KB04-72')}
                />
                {/* <div>RO3</div> */}
              </div>

            {
              canvasItems.map((item, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    cursor: 'move',
                    border: isMarkerPlaced ? '2px solid green' : 'none'
                  }}
                  onClick={(e) => handleMarkerClick(item, index, e)}
                >
                  <img
                    src={getImageForType(item.type)}
                    alt={item.type}
                    style={{ maxWidth: '3vw', maxHeight: '100%', filter:"grayscale(200%)" }}
                  />
                </div>
              ))
            }

            {
            itemToAdd && (
              <div
                draggable
                onDragStart={(e) => handleDragStart(e)}
                style={{
                  position: 'absolute',
                  left: '20px', // Default x position
                  top: '20px', // Default y position
                  cursor: 'move',
                }}
              >
                <img
                  src={getImageForType(itemToAdd)}
                  alt={itemToAdd}
                  style={{ maxWidth: '3vw', maxHeight: '100%', filter:"grayscale(200%)" }}
                />
              </div>
            )
            }

            </div>
          </div>
          <br></br>
          <div className="result-container">
            <div className="water-flow-container">
              <div className="result-cards">
                {data.map((item, index) => (
                  <ResultCard key={index} title={item.title} value={item.value} />
                ))}
              </div>
            </div>
          </div>

          <div className="result-container">
            <div className="water-flow-container">
              <div className="result-cards">
                {Object.entries(sensorValues).map(([title, value], index) => (
                  <ResultCard key={index} title={title} value={value} />
                ))}
              </div>
            </div>
          </div>


          {/* Leakage Markers */}
          {leakageMarkers.map((marker, index) => (
            <div 
              key={index}
              style={{
                position: 'absolute',
                left: `${marker.x}px`,
                top: `${marker.y}px`,
                cursor: 'pointer',
              }}
            onClick={() => { 
              // Handle clicking on a leakage marker (e.g., show information about the leakage)
              console.log(`Clicked leakage marker at x: ${marker.x}, y: ${marker.y}, rate: ${marker.rate} L/s`);
            }}
            >
            <img src={LeakageIcon} alt="Leakage" style={{ width: '20px', height: '20px' }
          }
        />
  </div>
))}

  </div>


        {/* Right Section */}
        <ResultContainer result={result} />
      </div>
    </div>
  );
};

export default SimulationPage;
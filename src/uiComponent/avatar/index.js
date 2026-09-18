import * as React from 'react';
import { useEffect , useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormControl, Select, MenuItem } from '@mui/material';
import { fetchStages, updateStages } from 'redux/action/actions';
export default function SizeAvatars(candidateId,stage,jobId) {
  const [selectedStage, setSelectedStage] = useState('');
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(fetchStages())
  },[])
  const stages = useSelector((state) => state.fetchStagesReducer.stages)
  const handleStageChange = (event) => {
    const newStage = event.target.value;
    setSelectedStage(newStage); 
    dispatch(updateStages(candidateId, { updatedStageName: newStage },jobId));
  };
  return (
    <FormControl fullWidth>

    <Select
      labelId="stages-label"
      id="stages-select"
      value={candidateId.stage|| selectedStage}
        onChange={handleStageChange}

    >
      {stages && stages.map((stage) => (
        <MenuItem key={stage.stageId} value={stage.stageName}>
          {stage.stageName}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  );
}

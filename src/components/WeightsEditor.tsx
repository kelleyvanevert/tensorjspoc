import React, { useState } from 'react';
import { Oracle } from './Oracle';

interface WeightsEditorProps {
  oracle: Oracle;
//   onUpdateWeights: (newWeights: Record<string, number>) => void;
}

const WeightsEditor: React.FC<WeightsEditorProps> = ({ 
    oracle, 
    // onUpdateWeights 
    }) => {
  const [weights, setWeights] = useState<Map<string, string>>(oracle.getWeightsHash());

  const handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>, feature: string) => {
    const updatedWeights = new Map(weights);
    updatedWeights.set(feature, event.target.value);
    setWeights(updatedWeights);
  };

  const handleSave = () => {
    const updatedWeights: Record<string, number> = {};
    weights.forEach((value, key) => {
      updatedWeights[key] = parseFloat(value);
    });
    oracle.setFeaturesAndUpdateWeights(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        updatedWeights,
    )
    // oracle.updateWeights(updatedWeights);
    // onUpdateWeights(oracle.getWeightsHash());
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(weights.entries()).map(([feature, weight]) => (
            <tr key={feature}>
              <td>{feature}</td>
              <td>
                <input
                  type="number"
                  step="0.001"
                  value={weight}
                  onChange={(e) => handleWeightChange(e, feature)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default WeightsEditor;

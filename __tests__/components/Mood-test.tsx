import { render } from '@testing-library/react-native';
import { Mood } from '../../src/components/Mood';
import { MoodIndex } from '../../src/interfaces';

describe("Mood compoment", () => {
    it('should have 2 buttons', () => {
        const mood = MoodIndex.SoSo
        const { getByTestId } = render(<Mood mood={mood} />);
        expect(getByTestId("MoodChoice.1")).toBeDefined();
        expect(getByTestId("MoodChoice.0")).toBeDefined();
    });

    it('should return all moods that can be enumerated', () => {
        const { getAllByText } = render(<Mood mood={MoodIndex.Depressed}></Mood>)
        
    })
    // it('should ')
})
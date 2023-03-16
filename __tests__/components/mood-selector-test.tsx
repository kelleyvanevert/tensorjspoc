import { fireEvent, render } from '@testing-library/react-native';
import { MoodComponent } from '../../src/components/mood-selector';
import { Moods } from '../../src/interfaces';

describe("mood-selector component", () => {
    it('should render all moods buttons', () => {
        const moods = Moods
        const callback = () => { };
        const { getByTestId } = render(<MoodComponent initialMood={Moods[0]} callback={callback} />);
        moods.forEach(mood => {
            expect(getByTestId(`MoodChoice.${mood.name}`)).toBeDefined();
        });
    });

    it('should execute callback function on setting mood', () => {
        const moods = Moods
        const callback = jest.fn()
        const { getByTestId } = render(<MoodComponent initialMood={Moods[0]} callback={callback} />);

        const firstButton = getByTestId(`MoodChoice.${moods[0].name}`);
        fireEvent(firstButton, 'onPress')
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should display current mood on the screen when corresponding mood button is clicked', () => {
        const moods = Moods
        const callback = jest.fn();
        const { getByTestId, getByText } = render(<MoodComponent initialMood={Moods[0]} callback={callback} />)

        const firstButton = getByTestId(`MoodChoice.${moods[0].name}`)
        fireEvent(firstButton, 'onPress')

        const text = getByText(`Mood: ${moods[0].name}`)
        expect(text).toBeTruthy();
    })
})
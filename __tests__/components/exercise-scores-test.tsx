import { fireEvent, render } from '@testing-library/react-native';
import { hasUncaughtExceptionCaptureCallback } from 'process';
import { ExerciseScores } from '../../src/components/ExerciseScores';
import { MoodComponent } from '../../src/components/ContextComponent';
import { IExcercise, Moods } from '../../src/interfaces';

describe("exercise-scores compoment", () => {
    it('should render an empty list of recommendations', () => {
        const tree = render(<ExerciseScores recommendations={[]} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('should render a recommendation with display name as test and value as 0', () => {
        const recommendation: IExcercise[] = [{
            DisplayName: 'test',
            ClickScore: 0,
            InternalName: '',
            Features: {
                mood_boost: 0,
                mood_value: 0,
                deffuse: 0,
                feeling_angry: 0,
                feeling_stressed: 0,
                five_seven_mins: 0,
                self_compassion: 0,
                seven_ten_mins: 0,
                three_five_mins: 0,
                zoom_out: 0
            }
        }]
        const tree = render(<ExerciseScores recommendations={recommendation} />).toJSON();
        expect(tree).toMatchSnapshot();
    })
})
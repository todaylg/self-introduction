import vertex1 from './vertex/fontType1.glsl';
import vertex2 from './vertex/fontType2.glsl';
import vertex3 from './vertex/fontType3.glsl';

import fragment1 from './fragment/fontType1.glsl';
import fragment2 from './fragment/fontType2.glsl';
import fragment3 from './fragment/fontType3.glsl';

export const fontShaders = [
	{ vertex: vertex1, fragment: fragment1 },
	{ vertex: vertex2, fragment: fragment2 },
	{ vertex: vertex3, fragment: fragment3 }
];

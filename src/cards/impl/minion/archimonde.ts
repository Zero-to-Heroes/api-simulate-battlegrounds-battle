import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { AfterHeroDamagedCard } from '../../card.interface';

export const Archimonde: AfterHeroDamagedCard = {
	cardIds: [CardIds.Archimonde_BG31_873, CardIds.Archimonde_BG31_873_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		input.hero.hpLeft = input.hero.hpLeft + input.damage;
	},
};

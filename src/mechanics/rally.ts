import { GameTag } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasRally } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { CardIds } from '../services/card-ids';
import { fixEnchantments } from '../simulation/enchantments';
import { FullGameState } from '../simulation/internal-game-state';
import { hasEntityMechanic } from '../utils';

const DOUBLE_RALLY_CARD_IDS: string[] = [CardIds.TimewarpedDeios_BG34_Giant_376];
const TRIPLE_RALLY_CARD_IDS: string[] = [CardIds.TimewarpedDeios_BG34_Giant_376_G];

export const triggerRally = (
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	attacker: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	gameState: FullGameState,
): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
	let damageDoneByAttacker = 0;
	let damageDoneByDefender = 0;
	const isAttackerRallying = hasEntityMechanic(attacker, GameTag.BACON_RALLY, gameState.allCards);

	const cardIds = [
		...attackingBoard.map((e) => e.cardId),
		...(attackingBoardHero.secrets?.map((e) => e.cardId) ?? []),
	];
	const triggerMult = cardIds.some((cardId) => TRIPLE_RALLY_CARD_IDS.includes(cardId))
		? 3
		: cardIds.some((cardId) => DOUBLE_RALLY_CARD_IDS.includes(cardId))
		? 2
		: 1;
	const numberOfRallyingCries =
		attackingBoardHero.questRewardEntities?.filter((r) => r.cardId === CardIds.RallyingCry_BG33_Reward_021)
			.length ?? 0;
	const multiplier = triggerMult + numberOfRallyingCries;
	const rallyLoops = !isAttackerRallying ? 1 : multiplier;

	for (let i = 0; i < rallyLoops; i++) {
		const onAttackImpl = cardMappings[attacker.cardId];
		if (hasRally(onAttackImpl)) {
			const { dmgDoneByAttacker, dmgDoneByDefender } = onAttackImpl.rally(attacker, {
				attacker: attacker,
				attackingHero: attackingBoardHero,
				attackingBoard: attackingBoard,
				defendingEntity: defendingEntity,
				defendingHero: defendingBoardHero,
				defendingBoard: defendingBoard,
				gameState,
				playerIsFriendly: attackingBoardHero.friendly,
			});
			damageDoneByAttacker += dmgDoneByAttacker;
			damageDoneByDefender += dmgDoneByDefender;
		}
		const enchantments = attacker.enchantments;
		for (const enchantment of enchantments) {
			const onAttackImpl = cardMappings[enchantment.cardId];
			if (hasRally(onAttackImpl)) {
				let enchantmentToMinion: BoardEntity = {
					...enchantment,
					entityId: attacker.entityId,
					attack: attacker.attack,
					health: attacker.health,
					maxHealth: attacker.maxHealth,
					maxAttack: attacker.maxAttack,
					abiityChargesLeft: attacker.abiityChargesLeft,
				};
				enchantmentToMinion = fixEnchantments(enchantmentToMinion, gameState.allCards);
				const { dmgDoneByAttacker, dmgDoneByDefender } = onAttackImpl.rally(enchantmentToMinion, {
					attacker: attacker,
					attackingHero: attackingBoardHero,
					attackingBoard: attackingBoard,
					defendingEntity: defendingEntity,
					defendingHero: defendingBoardHero,
					defendingBoard: defendingBoard,
					gameState,
					playerIsFriendly: attackingBoardHero.friendly,
				});
				damageDoneByAttacker += dmgDoneByAttacker;
				damageDoneByDefender += dmgDoneByDefender;
			}
		}
	}
	return { dmgDoneByAttacker: damageDoneByAttacker, dmgDoneByDefender: damageDoneByDefender };
};

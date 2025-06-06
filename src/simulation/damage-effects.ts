import { CardIds, CardType, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateDivineShield } from '../keywords/divine-shield';
import { pickRandom, pickRandomAlive } from '../services/utils';
import { addStatsToBoard, grantStatsToMinionsOfEachType, hasCorrectTribe } from '../utils';
import { dealDamageToRandomEnemy } from './attack';
import { addCardsInHand } from './cards-in-hand';
import { spawnEntities } from './deathrattle-spawns';
import { applyFrenzy } from './frenzy';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';

export const onEntityDamaged = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	damage: number,
	gameState: FullGameState,
): readonly BoardEntity[] => {
	const spawnedEntities: BoardEntity[] = [];
	const friendlyBoard =
		board?.[0]?.friendly === entity.friendly
			? board
			: otherBoard?.[0]?.friendly === entity.friendly
			? otherBoard
			: [];
	const enemyBoard =
		board?.[0]?.friendly === entity.friendly ? otherBoard : board?.[0]?.friendly === entity.friendly ? board : [];
	const friendlyHero = friendlyBoard === board ? hero : otherHero;
	const enemyHero = friendlyBoard === board ? otherHero : hero;

	if (entity.frenzyChargesLeft > 0 && entity.health > 0 && !entity.definitelyDead) {
		applyFrenzy(entity, friendlyBoard, friendlyHero, gameState);
		entity.frenzyChargesLeft--;
	}

	switch (entity.cardId) {
		case CardIds.WingedChimera_BG29_844:
		case CardIds.WingedChimera_BG29_844_G:
			if (entity.abiityChargesLeft > 0) {
				const wingedChimeraModifier = entity.cardId === CardIds.WingedChimera_BG29_844_G ? 2 : 1;
				grantStatsToMinionsOfEachType(
					entity,
					board,
					hero,
					wingedChimeraModifier * 1,
					wingedChimeraModifier * 1,
					gameState,
				);
				entity.abiityChargesLeft--;
			}
			break;
		case CardIds.UnforgivingTreant_BG29_846:
		case CardIds.UnforgivingTreant_BG29_846_G:
			const treantModifier = entity.cardId === CardIds.UnforgivingTreant_BG29_846_G ? 2 : 1;
			addStatsToBoard(entity, board, hero, treantModifier * 2, 0, gameState);
			break;
		case CardIds.Untameabull_BG29_878:
		case CardIds.Untameabull_BG29_878_G:
			updateDivineShield(entity, board, hero, otherHero, true, gameState);
			gameState.spectator.registerPowerTarget(entity, entity, board, hero, otherHero);
			break;
		case CardIds.TrustyPup_BG29_800:
		case CardIds.TrustyPup_BG29_800_G:
			const trustyPupStats = entity.cardId === CardIds.TrustyPup_BG29_800_G ? 2 : 1;
			modifyStats(entity, entity, trustyPupStats, 0, board, hero, gameState);
			break;
		case CardIds.SilverGoose_BG29_801:
		case CardIds.SilverGoose_BG29_801_G:
			spawnedEntities.push(
				...spawnEntities(
					entity.cardId === CardIds.SilverGoose_BG29_801_G
						? CardIds.SilverGoose_SilverFledglingToken_BG29_801_Gt
						: CardIds.SilverGoose_SilverFledglingToken_BG29_801t,
					1,
					board,
					hero,
					otherBoard,
					otherHero,
					gameState,
					entity.friendly,
					false,
				),
			);
			break;
		case CardIds.CraftyAranasi_BG29_821:
		case CardIds.CraftyAranasi_BG29_821_G:
			const aranasiLoops = entity.cardId === CardIds.CraftyAranasi_BG29_821_G ? 2 : 1;
			for (let i = 0; i < aranasiLoops; i++) {
				dealDamageToRandomEnemy(enemyBoard, enemyHero, entity, 5, friendlyBoard, friendlyHero, gameState);
			}
			break;
		case CardIds.MarineMatriarch_BG29_610:
		case CardIds.MarineMatriarch_BG29_610_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.MarineMatriarch_BG29_610_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => null);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
		case CardIds.VeryHungryWinterfinner_BG29_300:
		case CardIds.VeryHungryWinterfinner_BG29_300_G:
			const winterfinnerStats = entity.cardId === CardIds.VeryHungryWinterfinner_BG29_300_G ? 2 : 1;
			const minionInHand = pickRandom(
				hero.hand.filter(
					(e) => gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
				),
			);
			if (!!minionInHand) {
				minionInHand.attack += 2 * winterfinnerStats;
				minionInHand.health += winterfinnerStats;
				minionInHand.maxHealth += winterfinnerStats;
				gameState.spectator.registerPowerTarget(entity, minionInHand, board, hero, otherHero);
			}
			break;
		case CardIds.SoftHeartedSiren_BG26_590:
		case CardIds.SoftHeartedSiren_BG26_590_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.SoftHeartedSiren_BG26_590_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => null);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
		case CardIds.LongJohnCopper_BG29_831:
		case CardIds.LongJohnCopper_BG29_831_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.LongJohnCopper_BG29_831_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => null);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
		case CardIds.BristlingBuffoon_BG29_160:
		case CardIds.BristlingBuffoon_BG29_160_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.BristlingBuffoon_BG29_160_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => CardIds.BloodGem);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
	}

	handleOtherEntityEffects(entity, board, hero, otherBoard, otherHero, spawnedEntities, gameState);
	const finalSpawns = performEntitySpawns(
		spawnedEntities,
		board,
		hero,
		entity,
		board.length - (board.indexOf(entity) + 1),
		otherBoard,
		otherHero,
		gameState,
	);

	const entityRightToSpawns = board[board.indexOf(entity) + 1];
	finalSpawns.forEach((e) => {
		e.hasAttacked = entity.hasAttacked > 1 ? 1 : entityRightToSpawns?.hasAttacked ?? 0;
	});
	return finalSpawns;
};

const handleOtherEntityEffects = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	spawnedEntities: BoardEntity[],
	gameState: FullGameState,
) => {
	if (hasCorrectTribe(entity, hero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
		board
			.filter(
				(e) =>
					e.cardId === CardIds.IridescentSkyblazer_BG29_806 ||
					e.cardId === CardIds.IridescentSkyblazer_BG29_806_G,
			)
			.forEach((e) => {
				const stats = e.cardId === CardIds.IridescentSkyblazer_BG29_806_G ? 2 : 1;
				const target = pickRandom(board.filter((e) => e.entityId !== entity.entityId));
				if (!!target) {
					modifyStats(target, e, 2 * stats, stats, board, hero, gameState);
				}
			});
		board
			.filter(
				(e) =>
					e.cardId === CardIds.TrigoreTheLasher_BG29_807 || e.cardId === CardIds.TrigoreTheLasher_BG29_807_G,
			)
			.filter((e) => e.entityId !== entity.entityId)
			.forEach((e) => {
				const stats = e.cardId === CardIds.TrigoreTheLasher_BG29_807_G ? 2 : 1;
				modifyStats(e, e, 0, 2 * stats, board, hero, gameState);
			});
	}

	hero.trinkets
		.filter(
			(t) =>
				t.cardId === CardIds.TigerCarving_BG30_MagicItem_427 ||
				t.cardId === CardIds.TigerCarving_TigerCarvingToken_BG30_MagicItem_427t,
		)
		.forEach((carving) => {
			const target = pickRandomAlive(board);
			if (!!target) {
				const buff = carving.cardId === CardIds.TigerCarving_TigerCarvingToken_BG30_MagicItem_427t ? 4 : 2;
				modifyStats(target, carving, buff, 0, board, hero, gameState);
			}
		});
};

import { Card } from '../card.interface';
import { CrystalInfuserEnchantment } from './enchantments/crystal-infuser-enchantment';
import { GloriousGloop } from './hero-power/glorious-gloop';
import { AdmiralElizaGoreblade } from './minion/admiral-eliza-goreblade';
import { AnubarakNerubianKing } from './minion/anubarak-nerubian-king';
import { ArcaneCannoneer } from './minion/arcane-cannoneer';
import { Archimonde } from './minion/archimonde';
import { AridAtrocity } from './minion/arid-atrocity';
import { AssistantGuard } from './minion/assistant-guard';
import { Bannerboar } from './minion/bannerboar';
import { Beetle } from './minion/beetle';
import { BirdBuddy } from './minion/bird-buddy';
import { BlazingSkyfin } from './minion/blazing-skyfin';
import { BoarGamer } from './minion/boar-gamer';
import { BongoBopper } from './minion/bongo-bopper';
import { BriarbackBookie } from './minion/briarback-bookie';
import { BubbleGunner } from './minion/bubble-gunner';
import { BuzzingVermin } from './minion/buzzing-vermin';
import { CadaverCaretaker } from './minion/cadaver-caretaker';
import { ChampionOfThePrimus } from './minion/champion-of-the-primus';
import { Charlga } from './minion/charlga';
import { ClunkerJunker } from './minion/clunker-junker';
import { CruiseController } from './minion/cruise-controller';
import { DeathlyStriker } from './minion/deathly-striker';
import { DefiantShipwright } from './minion/defiant-shipwright';
import { DeflectoBot } from './minion/deflecto-bot';
import { EchoingRoar } from './minion/echoing-roar';
import { EfficientEngineer } from './minion/efficient-engineer';
import { ElectricSynthesizer } from './minion/electric-synthesizer';
import { FairyGillmother } from './minion/fairy-gillmother';
import { ForestRover } from './minion/forest-rover';
import { FountainChiller } from './minion/fountain-chiller';
import { GemRat } from './minion/gem-rat';
import { GemSmuggler } from './minion/gem-smuggler';
import { GeneralDrakkisath } from './minion/general-drakkisath';
import { GentleDjinni } from './minion/gentle-djinni';
import { GoldrinnTheGreatWolf } from './minion/goldrinn-the-great-wolf';
import { GreaseBot } from './minion/grease-bot';
import { GrittyHeadhunter } from './minion/gritty-headhunter';
import { Hackerfin } from './minion/hackerfin';
import { HandlessForsaken } from './minion/handless-forsaken';
import { HarmlessBonehead } from './minion/harmless-bonehead';
import { HoloRover } from './minion/holo-rover';
import { HummingBird } from './minion/humming-bird';
import { HungrySnapjaw } from './minion/hungry-snapjaw';
import { HunterOfGatherers } from './minion/hunter-of-gatherers';
import { ImplantSubject } from './minion/implant-subject';
import { ImposingPercussionist } from './minion/imposing-percussionist';
import { ImpulsiveTrickster } from './minion/impulsive-trickster';
import { IndomitableMount } from './minion/indomitable-mount';
import { InspiringUnderdog } from './minion/inspiring-underdog';
import { InterrogatorWhitemane } from './minion/interrogator-whitemane';
import { KalecgosArcaneAspect } from './minion/kalecgos-arcane-aspect';
import { KangorsApprentice } from './minion/kangors-apprentice';
import { KarmicChameleon } from './minion/karmic-chameleon';
import { KingBagurgle } from './minion/king-bagurgle';
import { LeeroyTheReckless } from './minion/leeroy-the-reckless';
import { LightfangEnforcer } from './minion/lightfang-enforcer';
import { LovesickBalladist } from './minion/lovesick-balladist';
import { Manasaber } from './minion/manasaber';
import { MarqueeTicker } from './minion/marquee-ticker';
import { MechaJaraxxus } from './minion/mecha-jaraxxus';
import { MechanizedGiftHorse } from './minion/mechanized-gift-horse';
import { Mechorse } from './minion/mechorse';
import { MenagerieJug } from './minion/menagerie-jug';
import { MisfitDragonling } from './minion/misfit-dragonling';
import { MoonsteelJuggernaut } from './minion/moonsteel-juggernaut';
import { Mummifier } from './minion/mummifier';
import { Murky } from './minion/murky';
import { MutatedLasher } from './minion/mutated-lasher';
import { NeonAgent } from './minion/neon-agent';
import { NerubianDeathswarmer } from './minion/nerubian-deathswarmer';
import { NestSwarmer } from './minion/nest-swarmer';
import { NetherDrake } from './minion/nether-drake';
import { Niuzao } from './minion/niuzao';
import { OozelingGladiator } from './minion/oozeling-gladiator';
import { OperaticBelcher } from './minion/operatic-belcher';
import { OutbackSmolderer } from './minion/outback-smolderer';
import { ParchedWanderer } from './minion/parched-wanderer';
import { PeggySturdybone } from './minion/peggy-sturdybone';
import { PrimalfinLookout } from './minion/primalfin-lookout';
import { PrizedPromoDrake } from './minion/prized-promo-drake';
import { RapscallionRecruiter } from './minion/rapscallion-recruiter';
import { RazorfenGeomancer } from './minion/razorfen-geomancer';
import { RazorgoreTheUntamed } from './minion/razorgore-the-untamed';
import { RecklessCliffdiver } from './minion/reckless-cliffdiver';
import { RipsnarlCaptain } from './minion/ripsnarl-captain';
import { RodeoPerformer } from './minion/rodeo-performer';
import { RunedProgenitor } from './minion/runed-progenitor';
import { RylakMetalhead } from './minion/rylak-metalhead';
import { SaltyHog } from './minion/salty-hog';
import { SanlaynScribe } from './minion/sanlayn-scribe';
import { Scallywag } from './minion/scallywag';
import { ShellCollector } from './minion/shell-collector';
import { ShowyCyclist } from './minion/showy-cyclist';
import { SilverHandedRecruit } from './minion/silver-handed-recruit';
import { SindoreiStraightShot } from './minion/sinodorei-straight-shot';
import { SkyPirateFlagbearer } from './minion/sky-pirate-flagbearer';
import { SkyPirateFlagbearerEnchantment } from './minion/sky-pirate-flagbearer-enchantment';
import { SlyRaptor } from './minion/sly-raptor';
import { Smolderwing } from './minion/smolderwing';
import { SoulRewinder } from './minion/soul-rewinder';
import { Spacefarer } from './minion/spacefarer';
import { Swampstriker } from './minion/swampstriker';
import { ThreeLilQuilboar } from './minion/three-lil-quilboar';
import { ThunderingAbomination } from './minion/thundering-abomination';
import { Tichondrius } from './minion/tichondrius';
import { TransmutedBramblewitch } from './minion/transmuted-bramblewitch';
import { TunnelBlaster } from './minion/tunnel-blaster';
import { TurquoiseSkitterer } from './minion/turquoise-skitterer';
import { TwilightPrimordium } from './minion/twilight-primordium';
import { UltravioletAscendant } from './minion/ultraviolet-ascendant';
import { WanderingWight } from './minion/wandering-wight';
import { WhelpSmuggler } from './minion/whelp-smuggler';
import { WispInTheShell } from './minion/wisp-in-the-shell';

const cards = [
	HoloRover,
	ForestRover,
	Beetle,
	BuzzingVermin,
	GemRat,
	NestSwarmer,
	RunedProgenitor,
	TurquoiseSkitterer,
	EfficientEngineer,
	NetherDrake,
	ElectricSynthesizer,
	OutbackSmolderer,
	RazorgoreTheUntamed,
	UltravioletAscendant,
	TwilightPrimordium,
	GentleDjinni,
	MoonsteelJuggernaut,
	MarqueeTicker,
	RecklessCliffdiver,
	FountainChiller,
	NeonAgent,
	ImplantSubject,
	Hackerfin,
	BubbleGunner,
	FairyGillmother,
	ShowyCyclist,
	ArcaneCannoneer,
	MutatedLasher,
	GloriousGloop,
	SilverHandedRecruit,
	SaltyHog,
	Spacefarer,
	GrittyHeadhunter,
	CrystalInfuserEnchantment,
	BoarGamer,
	Bannerboar,
	WanderingWight,
	DeathlyStriker,
	WispInTheShell,
	HandlessForsaken,
	HarmlessBonehead,
	CadaverCaretaker,
	HungrySnapjaw,
	Niuzao,
	BirdBuddy,
	SlyRaptor,
	Manasaber,
	RylakMetalhead,
	HummingBird,
	MechanizedGiftHorse,
	Mechorse,
	IndomitableMount,
	KarmicChameleon,
	GoldrinnTheGreatWolf,
	ImpulsiveTrickster,
	MechaJaraxxus,
	WhelpSmuggler,
	HunterOfGatherers,
	BlazingSkyfin,
	GeneralDrakkisath,
	Smolderwing,
	MisfitDragonling,
	KalecgosArcaneAspect,
	GreaseBot,
	ClunkerJunker,
	KangorsApprentice,
	DeflectoBot,
	Swampstriker,
	Murky,
	OperaticBelcher,
	ParchedWanderer,
	PrimalfinLookout,
	KingBagurgle,
	ShellCollector,
	TunnelBlaster,
	LeeroyTheReckless,
	InterrogatorWhitemane,
	OozelingGladiator,
	RodeoPerformer,
	AssistantGuard,
	AridAtrocity,
	InspiringUnderdog,
	LightfangEnforcer,
	DefiantShipwright,
	PeggySturdybone,
	RapscallionRecruiter,
	LovesickBalladist,
	AdmiralElizaGoreblade,
	SkyPirateFlagbearer,
	SkyPirateFlagbearerEnchantment,
	CruiseController,
	RipsnarlCaptain,
	Scallywag,
	RazorfenGeomancer,
	Charlga,
	GemSmuggler,
	BongoBopper,
	ThreeLilQuilboar,
	AnubarakNerubianKing,
	NerubianDeathswarmer,
	SindoreiStraightShot,
	ChampionOfThePrimus,
	Mummifier,
	EchoingRoar,
	MenagerieJug,
	ThunderingAbomination,
	PrizedPromoDrake,
	TransmutedBramblewitch,
	ImposingPercussionist,
	SoulRewinder,
	Tichondrius,
	Archimonde,
	SanlaynScribe,
	BriarbackBookie,
];

export const cardMappings: { [cardId: string]: Card } = {};
for (const card of cards) {
	const cardIds = card.cardIds ?? [];
	for (const cardId of cardIds) {
		cardMappings[cardId] = card;
	}
}

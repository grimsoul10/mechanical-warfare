const elib = require("mechanical-warfare/effectlib");
const plib = require("mechanical-warfare/plib");

const hoverUnit = prov(() => extend(HoverUnit, {
	drawEngine(){
		Draw.color(this.type.getEngineColor());
		var ox = Angles.trnsx(this.rotation + 180, this.type.engineOffset);
		var oy = Angles.trnsy(this.rotation + 180, this.type.engineOffset);
		var oSize = Mathf.absin(Time.time(), 2, this.type.engineSize / 4);
		Fill.circle(this.x + ox, this.y + oy, this.type.engineSize + oSize);
		
		Draw.color(Color.white);
		var ix = Angles.trnsx(this.rotation + 180, this.type.engineOffset - 1);
		var iy = Angles.trnsy(this.rotation + 180, this.type.engineOffset - 1);
		var iSize = Mathf.absin(Time.time(), 2, this.type.engineSize / 4);
		Fill.circle(this.x + ix, this.y + iy, (this.type.engineSize + oSize) / 2);
		Draw.color();
	}
}));

// Battleaxe
const axeLava = extend(LiquidBulletType, {
	init(){
		this.liquid = Vars.content.getByName(ContentType.liquid, "mechanical-warfare-liquid-lava");
		this.super$init();
	}
});
axeLava.speed = 1;
axeLava.lifetime = 2;
axeLava.damage = 2;

const axe = extend(MissileBulletType, {
	draw(b){
		this.super$draw(b);
	}
});
axe.bulletWidth = 5;
axe.bulletHeight = 12;
axe.bulletShrink = 0.4;
axe.inaccuracy = 2;
axe.speed = 4;
axe.lifetime = 50;
axe.splashDamage = 24;
axe.splashDamageRadius = 16;
axe.frontColor = plib.frontColorLava;
axe.backColor = plib.backColorLava;
axe.shootEffect = Fx.shootBig;
axe.smokeEffect = Fx.shootBigSmoke;
axe.fragBullets = 3;
axe.fragBullet = axeLava;

const axeLauncher = extendContent(Weapon, "axe-launcher", {
	load(){
		this.region = Core.atlas.find("mechanical-warfare-axe-launcher-equip");
	}
});
axeLauncher.width = 7;
axeLauncher.recoil = 3;
axeLauncher.reload = 30;
axeLauncher.alternate = false;
axeLauncher.inaccuracy = 5;
axeLauncher.shots = 2;
axeLauncher.spacing = 0;
axeLauncher.shotDelay = 1;
axeLauncher.shootSound = Sounds.missile;
axeLauncher.bullet = axe;

const battleaxe = extendContent(UnitType, "battleaxe", {
	load(){
		this.weapon.load();
		this.region = Core.atlas.find(this.name);
	},
	getEngineColor: function(){
		return plib.engineColorCyan;
	}
});
battleaxe.weapon = axeLauncher;
battleaxe.create(hoverUnit);

const battleaxeFactory = extendContent(UnitFactory, "battleaxe-factory", {});
battleaxeFactory.unitType = battleaxe;

// Scythe
const scytheShell = extend(BasicBulletType, {
	draw(b){
		this.super$draw(b);
		if(b.timer.get(0, 3)){
			Effects.effect(this.trailEffect, b.x, b.y, b.rot());
		}
	}
});
scytheShell.collides = true;
scytheShell.collidesTiles = true;
scytheShell.collidesAir = true;
scytheShell.inaccuracy = 3;
scytheShell.bulletWidth = 10;
scytheShell.bulletHeight = 16;
scytheShell.frontColor = plib.frontColorCyan;
scytheShell.backColor = plib.backColorCyan;
scytheShell.speed = 7;
scytheShell.lifetime = 25;
scytheShell.damage = 15;
scytheShell.splashDamage = 15;
scytheShell.splashDamageRadius = 6;
scytheShell.shootEffect = Fx.shootBig;
scytheShell.smokeEffect = Fx.shootBigSmoke;
scytheShell.hitSound = Sounds.explosion;
scytheShell.trailEffect = newEffect(30, e => {
	elib.fillCircle(e.x, e.y, scytheShell.frontColor, 1, 0.2 + e.fout() * 2.5);
});
scytheShell.hitEffect = newEffect(27, e => {
	e.scaled(6, cons(i => {
		var thickness = i.fout() * 2;
		var radius = i.fout() * 8;
		elib.outlineCircle(e.x, e.y, scytheShell.frontColor, thickness, radius);
	}));
	
	var lnThickness = e.fout() * 2;
	var lnDistance = 4 + e.fin() * 16;
	var lnLength = e.fout() * 3;
	elib.splashLines(e.x, e.y, scytheShell.frontColor, lnThickness, lnDistance, lnLength, 3, e.id);
	
	var crRadius = e.fout() * 4;
	var crDistance = e.fin() * 6;
	elib.splashCircles(e.x, e.y, Color.gray, 1, crRadius, crDistance, 4, e.id + 1);
});
scytheShell.despawnEffect = scytheShell.hitEffect;

const scytheLauncher = extendContent(Weapon, "scythe-launcher", {
	load(){
		this.region = Core.atlas.find("mechanical-warfare-scythe-launcher-equip");
	}
});
scytheLauncher.width = 9;
scytheLauncher.recoil = 3;
scytheLauncher.reload = 50;
scytheLauncher.alternate = true;
scytheLauncher.inaccuracy = 2;
scytheLauncher.shots = 8;
scytheLauncher.spacing = 0.5;
scytheLauncher.shotDelay = 1;
scytheLauncher.velocityRnd = 0.3;
scytheLauncher.shootSound = Sounds.artillery;
scytheLauncher.ejectEffect = Fx.shellEjectBig;
scytheLauncher.bullet = scytheShell;

const scythe = extendContent(UnitType, "scythe", {
	load(){
		this.weapon.load();
		this.region = Core.atlas.find(this.name);
	},
	getEngineColor: function(){
		return plib.engineColorCyan;
	}
});
scythe.weapon = scytheLauncher;
scythe.create(hoverUnit);

const scytheFactory = extendContent(UnitFactory, "scythe-factory", {});
scytheFactory.unitType = scythe;
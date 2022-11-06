drop database if exists pelitietokanta;
create database pelitietokanta;

use pelitietokanta;

create table peli(
    numero integer not null primary key,
    nimi varchar(27) not null,
    vuosi integer not null,
    lukumaara integer not null,
    genre varchar(11) not null
);

create user if not exists 'oona'@'localhost' identified by 'cnceK9V0';

grant all privileges on pelitietokanta.* to 'oona'@'localhost';

insert into peli values(1,"Palapeli",2018,13,"FPS");
insert into peli values(2,"Future 2025",2005,25,"strategia");
insert into peli values(3,"Imperiumin aika 2",2010,150,"tollopeli");
insert into peli values(4,"Leppis",1990,30,"tasohyppely");
insert into peli values(5,"Unohdus 2000",2015,10,"seikkailu");
insert into peli values(6,"Ufopeli",2017,15,"älypeli");
insert into peli values(7,"Tähtiseikkailu",2012,20,"lautapeli");

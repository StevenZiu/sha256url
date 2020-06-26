create database if not exists sha256url;
use sha256url;

create table if not exists hashlinks (
  url_id int not null auto_increment,
  original_url varchar(2000) not null,
  long_hash varchar(400) not null,
  short_hash varchar(10) not null,
  primary key(url_id),
  unique(url_id, original_url, long_hash) 
)
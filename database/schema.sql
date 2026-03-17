create table if not exists users(
    id serial primary key,
    email varchar(100) unique not null,
    password varchar(100) not null,
    userName text unique not null,
    created_at timestamp default now()
)
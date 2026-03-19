create table if not exists users(
    id serial primary key,
    email varchar(100) unique not null,
    password varchar(100) not null,
    userName text unique not null,
    created_at timestamp default now()
);

create table if not exists posts(
    id serial primary key,
    content text not null,
    user_id int references users(id) on delete cascade,
    created_at timestamp default now(),
    updated_at timestamp default now()
);
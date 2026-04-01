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

create table if not exists likes(
    id serial primary key,
    post_id int references posts(id),
    user_id int references users(id) on delete cascade,
    liked_at timestamp default now(),
    unique(post_id,user_id)
);

create table if not exists comments(
    id serial primary key,
    post_id int references posts(id) on delete cascade,
    user_id int references users(id) on delete cascade,
    content text not null,
    commented_on timestamp default now(),
    updated_at timestamp default now()
);

create table if not exists follow(
    follower_id int references users(id),
    following_id int references users(id),
    unique(follower_id,following_id)
);
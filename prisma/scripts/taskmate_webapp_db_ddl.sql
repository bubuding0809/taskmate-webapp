show databases;
use `taskmate-db`;

create table if not exists Folder (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    folder_name varchar(191) NOT NULL,
    thumbnail_image varchar(191),
    collapsed bool DEFAULT(FALSE) NOT NULL,
    board_order varchar(1000),
    user_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Board (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    user_id varchar(191) NOT NULL,
    folder_id varchar(191),
    board_title varchar(191),
    board_description varchar(500),
    panelOrder varchar(1000),
    visibility enum('PUBLIC', 'TEAM', 'PRIVATE') DEFAULT 'PRIVATE' NOT NULL,
    background_image varchar(191),
    background_color varchar(6),
    cover_image varchar(191),
    thumbnail_image varchar(191),
    created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(folder_id) REFERENCES Folder(id) ON DELETE SET NULL ON UPDATE CASCADE
);

create table if not exists Board_Collaborator (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    permission enum('READ', 'WRITE', 'ADMIN') DEFAULT 'READ' NOT NULL,
    user_id varchar(191) NOT NULL,
    board_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(board_id) REFERENCES Board(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Board_Message (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    message varchar(1000) NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id varchar(191) NOT NULL,
    board_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(board_id) REFERENCES Board(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Tag (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    tag_name varchar(191) NOT NULL,
    user_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Board_Tag (
    tag_name varchar(191) NOT NULL,
    board_id varchar(191) NOT NULL,
    PRIMARY KEY(tag_name, board_id),
    FOREIGN KEY(board_id) REFERENCES Board(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(tag_name) REFERENCES Tag(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Team (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    team_name varchar(191) NOT NULL,
    team_description varchar(500),
    thumbnail_image varchar(191),
    user_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Team_Board_Rel (
    team_id varchar(191) NOT NULL,
    board_id varchar(191) NOT NULL,
    PRIMARY KEY(team_id, board_id),
    CREATED_AT datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY(team_id) REFERENCES Team(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(board_id) REFERENCES Board(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Panel (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    panel_title varchar(191),
    task_order varchar(1000),
    is_visible bool DEFAULT(TRUE) NOT NULL,
    panel_color varchar(6),
    show_completed_tasks bool DEFAULT(FALSE) NOT NULL,
    board_id varchar(191) NOT NULL,
    FOREIGN KEY(board_id) REFERENCES Board(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Task (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    task_title varchar(191),
    task_details varchar(500),
    order INTEGER,
    start_datetime datetime,
    end_datetime datetime,
    is_completed bool DEFAULT(FALSE) NOT NULL,
    panel_id varchar(191) NOT NULL,
    parent_task_id varchar(191),
    FOREIGN KEY(panel_id) REFERENCES Panel(id) ON DELETE CASCADE ON UPDATE CASCADE
    FOREIGN KEY(parent_task_id) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Task_Assign_Rel (
    task_id varchar(191) NOT NULL,
    user_id varchar(191) NOT NULL,
    PRIMARY KEY(task_id, user_id),
    FOREIGN KEY(task_id) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Sub_Task_Rel (
    parent_task_id varchar(191) NOT NULL,
    sub_task_id varchar(191) NOT NULL,
    PRIMARY KEY(parent_task_id, sub_task_id),
    FOREIGN KEY(parent_task_id) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(sub_task_id) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table Attachment (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    attachment_url varchar(191) NOT NULL,
    attachment_type enum('IMAGE', 'FILE') NOT NULL,
    is_cover_image bool DEFAULT(FALSE) NOT NULL,
    user_id varchar(191) NOT NULL,
    task_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(task_id) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Label (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    label_name varchar(191) NOT NULL,
    label_color varchar(6) NOT NULL,
    user_id varchar(191) NOT NULL,
    board_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Task_Label_Rel (
    task_id varchar(191) NOT NULL,
    label_id varchar(191) NOT NULL,
    PRIMARY KEY(task_id, label_id),
    FOREIGN KEY(task_id) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(label_id) REFERENCES Label(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists Task_Activity (
    id varchar(191) DEFAULT(UUID()) PRIMARY KEY,
    activity_type enum('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'UNASSIGN', 'COMPLETE', 'UNCOMPLETE', 'ATTACH', 'UNATTACH', 'COMMENT', 'SUBTASK_CREATE', 'SUBTASK_UPDATE', 'SUBTASK_DELETE', 'SUBTASK_COMPLETE', 'SUBTASK_UNCOMPLETE') NOT NULL,
    activity_details varchar(500),
    created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id varchar(191) NOT NULL,
    task_id varchar(191) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(task_id) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE
);
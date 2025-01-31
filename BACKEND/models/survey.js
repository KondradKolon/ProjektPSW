export class Question {
    constructor(id, text, type, options = []) {
        this.id = id; 
        this.text = text; 
        this.type = type;
        this.options = options;
    }
}

export class Survey {
    constructor(id, title, description,authorID, questions = []) {
        this.id = id;
        this.title = title; 
        this.description = description;
        this.authorID =authorID;
        this.questions = questions;
        
    }
}


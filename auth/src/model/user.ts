import mongoose from 'mongoose';

// Describe the properties required to create new user
interface UserAttrs {
  email: string;
  password: string;
}

// Describe property (static method) of user model
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Describe property of a User document
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// Type of constructor: <T extends Document, U extends Model<T>>
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };

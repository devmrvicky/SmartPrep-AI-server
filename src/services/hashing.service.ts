import bcrypt from "bcryptjs";

class HashingService {
  async hash(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(data, salt);
  }

  async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}

export default new HashingService();

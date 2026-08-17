export type OfficialLookupItem = {
  id: string;
  title: string;
  where: string;
  note: string;
};

export const officialLookupItems: OfficialLookupItem[] = [
  {
    id: "damage-record",
    title: "Hasar/TRAMER kaydı",
    where:
      "e-Devlet Kapısı (turkiye.gov.tr) üzerinden ilgili sorgu hizmetini arayın, veya sigorta şirketinizden isteyin.",
    note: "Hasar tutarı ve tarihleri resmi kayıtla doğrulanmadan satın alma kararı vermeyin. Kayıt bulunmaması aracın hiç hasar görmediği anlamına gelmez; sigortasız veya nakit onarılan hasarlar bu kayda hiç yansımayabilir.",
  },
  {
    id: "inspection-status",
    title: "Muayene durumu",
    where: "TÜVTÜRK'ün resmi kanallarından veya e-Devlet Kapısı üzerinden.",
    note: "Muayenesi geçmiş araçlarda ek kusur çıkma riski artar.",
  },
  {
    id: "mtv-debt",
    title: "MTV borcu",
    where: "e-Devlet Kapısı üzerinden ilgili vergi sorgu hizmetini arayın, veya bağlı vergi dairesinden.",
    note: "Ödenmemiş MTV, devir işlemini engelleyebilir.",
  },
  {
    id: "lien-status",
    title: "Rehin/haciz/borç durumu",
    where: "e-Devlet Kapısı üzerinden ilgili sorgu hizmetini arayın; devir işlemini yapacak noterde de görüntülenir.",
    note: "Rehinli veya haczi olan araçlarda devir işlemi tamamlanamayabilir.",
  },
  {
    id: "ownership-verification",
    title: "Ruhsat sahipliği teyidi",
    where: "Noterde satış/devir işlemi sırasında resmi kayıttan otomatik doğrulanır.",
    note: "Ruhsat sahibinin satıcıyla aynı kişi olduğundan emin olun; vekaletle satışta yetkiyi ayrıca doğrulayın.",
  },
  {
    id: "insurance-policy",
    title: "Trafik sigortası poliçesi",
    where: "İlgili sigorta şirketi veya acentesinden poliçe numarasıyla teyit edin.",
    note: "Poliçesiz veya süresi dolmuş araç kullanımı yasal risk oluşturur.",
  },
  {
    id: "mileage-consistency",
    title: "Kilometre tutarlılığı",
    where:
      "TÜVTÜRK muayene geçmişindeki (her muayenede kilometre kaydedilir) ve yetkili servis/bakım faturalarındaki km değerlerini ilandaki km ile karşılaştırın.",
    note: "Kilometre düşürme ikinci elde sık görülen bir sorundur. Muayene ve servis kayıtlarındaki km zaman içinde geriye gitmemeli; ilandaki km bu kayıtlarla tutarsızsa satıcıya ve ekspertiz firmasına ayrıca sorun.",
  },
];

export const officialLookupDisclaimer =
  "EksperIQ bu sorguların hiçbirini kendisi yapmaz veya sonuçlarını garanti etmez; yalnızca nereden kontrol edebileceğinizi hatırlatır. Güncel adres ve hizmet adları değişebilir, resmi kaynaktaki adımları izleyin.";

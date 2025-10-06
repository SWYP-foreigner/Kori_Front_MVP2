import api from '@/api/axiosInstance';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';

type Lang = { label: string; code: string };

const LANGUAGES: string[] = [
  'Abkhaz [AB]',
  'Acehnese [ACE]',
  'Acholi [ACH]',
  'Afrikaans [AF]',
  'Albanian [SQ]',
  'Alur [ALZ]',
  'Amharic [AM]',
  'Arabic [AR]',
  'Armenian [HY]',
  'Assamese [AS]',
  'Awadhi [AWA]',
  'Aymara [AY]',
  'Azerbaijani [AZ]',
  'Balinese [BAN]',
  'Bambara [BM]',
  'Bashkir [BA]',
  'Basque [EU]',
  'Batak Karo [BTX]',
  'Batak Simalungun [BTS]',
  'Batak Toba [BBC]',
  'Belarusian [BE]',
  'Bemba [BEM]',
  'Bengali [BN]',
  'Betawi [BEW]',
  'Bhojpuri [BHO]',
  'Bikol [BIK]',
  'Bosnian [BS]',
  'Breton [BR]',
  'Bulgarian [BG]',
  'Buryat [BUA]',
  'Cantonese [YUE]',
  'Catalan [CA]',
  'Cebuano [CEB]',
  'Chichewa [NY]',
  'Chinese (Simplified) [ZH-CN]',
  'Chinese (Traditional) [ZH-TW]',
  'Chuvash [CV]',
  'Corsican [CO]',
  'Crimean Tatar [CRH]',
  'Croatian [HR]',
  'Czech [CS]',
  'Danish [DA]',
  'Dinka [DIN]',
  'Divehi [DV]',
  'Dogri [DOI]',
  'Dombe [DOV]',
  'Dutch [NL]',
  'Dzongkha [DZ]',
  'English [EN]',
  'Esperanto [EO]',
  'Estonian [ET]',
  'Ewe [EE]',
  'Fijian [FJ]',
  'Filipino [FIL]',
  'Finnish [FI]',
  'French [FR]',
  'French (French) [FR-FR]',
  'French (Canadian) [FR-CA]',
  'Frisian [FY]',
  'Fulfulde [FF]',
  'Ga [GAA]',
  'Galician [GL]',
  'Ganda [LG]',
  'Georgian [KA]',
  'German [DE]',
  'Greek [EL]',
  'Guarani [GN]',
  'Gujarati [GU]',
  'Haitian Creole [HT]',
  'Hakha Chin [CNH]',
  'Hausa [HA]',
  'Hawaiian [HAW]',
  'Hebrew [IW]',
  'Hiligaynon [HIL]',
  'Hindi [HI]',
  'Hmong [HMN]',
  'Hungarian [HU]',
  'Hunsrik [HRX]',
  'Icelandic [IS]',
  'Igbo [IG]',
  'Iloko [ILO]',
  'Indonesian [ID]',
  'Irish [GA]',
  'Italian [IT]',
  'Japanese [JA]',
  'Javanese [JW]',
  'Kannada [KN]',
  'Kapampangan [PAM]',
  'Kazakh [KK]',
  'Khmer [KM]',
  'Kiga [CGG]',
  'Kinyarwanda [RW]',
  'Kituba [KTU]',
  'Konkani [GOM]',
  'Korean [KO]',
  'Krio [KRI]',
  'Kurdish (Kurmanji) [KU]',
  'Kurdish (Sorani) [CKB]',
  'Kyrgyz [KY]',
  'Lao [LO]',
  'Latgalian [LTG]',
  'Latin [LA]',
  'Latvian [LV]',
  'Ligurian [LIJ]',
  'Limburgan [LI]',
  'Lingala [LN]',
  'Lithuanian [LT]',
  'Lombard [LMO]',
  'Luo [LUO]',
  'Luxembourgish [LB]',
  'Macedonian [MK]',
  'Maithili [MAI]',
  'Makassar [MAK]',
  'Malagasy [MG]',
  'Malay [MS]',
  'Malay (Jawi) [MS-ARAB]',
  'Malayalam [ML]',
  'Maltese [MT]',
  'Maori [MI]',
  'Marathi [MR]',
  'Meadow Mari [CHM]',
  'Meiteilon [MNI-MTEI]',
  'Minang [MIN]',
  'Mizo [LUS]',
  'Mongolian [MN]',
  'Myanmar (Burmese) [MY]',
  'Ndebele (South) [NR]',
  'Nepalbhasa [NEW]',
  'Nepali [NE]',
  'Northern Sotho [NSO]',
  'Norwegian [NO]',
  'Nuer [NUS]',
  'Occitan [OC]',
  'Odia [OR]',
  'Oromo [OM]',
  'Pangasinan [PAG]',
  'Papiamento [PAP]',
  'Pashto [PS]',
  'Persian [FA]',
  'Polish [PL]',
  'Portuguese [PT]',
  'Portuguese (Portugal) [PT-PT]',
  'Portuguese (Brazil) [PT-BR]',
  'Punjabi [PA]',
  'Punjabi (Shahmukhi) [PA-ARAB]',
  'Quechua [QU]',
  'Romani [ROM]',
  'Romanian [RO]',
  'Rundi [RN]',
  'Russian [RU]',
  'Samoan [SM]',
  'Sango [SG]',
  'Sanskrit [SA]',
  'Scots Gaelic [GD]',
  'Serbian [SR]',
  'Sesotho [ST]',
  'Seychellois Creole [CRS]',
  'Shan [SHN]',
  'Shona [SN]',
  'Sicilian [SCN]',
  'Silesian [SZL]',
  'Sindhi [SD]',
  'Sinhala [SI]',
  'Slovak [SK]',
  'Slovenian [SL]',
  'Somali [SO]',
  'Spanish [ES]',
  'Sundanese [SU]',
  'Swahili [SW]',
  'Swati [SS]',
  'Swedish [SV]',
  'Tajik [TG]',
  'Tamil [TA]',
  'Tatar [TT]',
  'Telugu [TE]',
  'Tetum [TET]',
  'Thai [TH]',
  'Tigrinya [TI]',
  'Tsonga [TS]',
  'Tswana [TN]',
  'Turkish [TR]',
  'Turkmen [TK]',
  'Twi [AK]',
  'Ukrainian [UK]',
  'Urdu [UR]',
  'Uyghur [UG]',
  'Uzbek [UZ]',
  'Vietnamese [VI]',
  'Welsh [CY]',
  'Xhosa [XH]',
  'Yiddish [YI]',
  'Yoruba [YO]',
  'Yucatec Maya [YUA]',
  'Zulu [ZU]',
];

const toOptions = (arr: string[]): Lang[] =>
  arr.map((s) => {
    const m = s.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
    return { label: m ? m[1].trim() : s, code: m ? m[2].trim() : s };
  });

export default function TranslateScreen() {
  const OPTIONS = useMemo<Lang[]>(() => toOptions(LANGUAGES), []);
  const [selected, setSelected] = useState<string>('EN');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[lang:init] GET /api/v1/member/profile/setting');
        const res = await api.get('/api/v1/member/profile/setting', { validateStatus: () => true });
        console.log('[lang:init] res', res.status, res.data);
        if (!mounted) return;

        if (res.status === 200) {
          const raw = (res.data as any)?.language?.[0];
          const ui = (typeof raw === 'string' && raw.trim() ? raw : 'en').toUpperCase();
          setSelected(ui);
        } else {
          console.warn('[lang:init] non-200', res.status);
        }
      } catch (e) {
        console.warn('[lang:init] failed', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveLanguage = async (raw: string) => {
    const uiCode = String(raw).trim().toUpperCase();
    const serverCode = uiCode.toLowerCase();
    setSaving(true);
    try {
      console.log('[lang:save] PUT /api/v1/mypage/user/language', { language: serverCode });
      const res = await api.put(
        '/api/v1/mypage/user/language',
        { language: serverCode },
        { validateStatus: () => true },
      );
      console.log('[lang:save] res', res.status, res.data);

      if (res.status === 200 || res.status === 204) {
        setSelected(uiCode);
        return;
      }
      throw new Error(res.data?.message || `HTTP ${res.status}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Please try again.';
      Alert.alert('Save failed', String(msg));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const onPick = async (code: string) => {
    if (saving) return;
    if (selected.toUpperCase() === code.toUpperCase()) return;

    const prev = selected;
    setSelected(code.toUpperCase());
    try {
      await saveLanguage(code);
    } catch {
      setSelected(prev);
    }
  };

  return (
    <Safe>
      <Header>
        <BackBtn onPress={() => router.back()} hitSlop={HIT}>
          <AntDesign name="left" size={20} color="#fff" />
        </BackBtn>

        <HeaderCenter>
          <Title>Chat Translation Language</Title>
        </HeaderCenter>

        <RightSlot>{saving ? <ActivityIndicator size="small" color="#30F59B" /> : null}</RightSlot>
      </Header>

      <Body>
        {OPTIONS.map(({ label, code }) => {
          const active = selected.toUpperCase() === code.toUpperCase();
          return (
            <Row
              key={code}
              onPress={() => onPick(code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: saving }}
              hitSlop={HIT}
              active={active}
              disabled={saving}
            >
              <RowText active={active}>
                {label} [{code}]
              </RowText>
              {active && (
                <CheckWrap>
                  <MaterialIcons name="check" size={18} color="#30F59B" />
                </CheckWrap>
              )}
            </Row>
          );
        })}
      </Body>
    </Safe>
  );
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

const Safe = styled.SafeAreaView`
  flex: 1;
  background: #1d1e1f;
`;
const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
`;
const BackBtn = styled.Pressable`
  width: 40px;
  align-items: flex-start;
`;
const HeaderCenter = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const RightSlot = styled.View`
  width: 40px;
  align-items: flex-end;
  justify-content: center;
`;
const Title = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_500Bold';
`;
const Body = styled.ScrollView`
  padding: 12px 16px;
`;
const Row = styled.Pressable<{ active: boolean; disabled?: boolean }>`
  height: 48px;
  border-radius: 10px;
  padding: 0 16px;
  margin-bottom: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: ${({ active }) => (active ? '#2A2B2C' : 'transparent')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const RowText = styled.Text<{ active: boolean }>`
  color: ${({ active }) => (active ? '#EDEFF1' : '#E1E3E6')};
  font-size: 16px;
  font-family: 'PlusJakartaSans_500SemiBold';
`;
const CheckWrap = styled.View`
  margin-left: 10px;
`;
